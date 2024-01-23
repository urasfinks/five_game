function HomePageRouter() {

    this.constructor = function () {
        bridge.call("Hide", {"case": "customLoader"});

        bridge.call("DbQuery", {
            "sql": "select * from data where key_data = ? and is_remove_data = 0 order by id_data desc",
            "args": ["Game"],
            "onFetch": {
                "jsRouter": "HomePage.ai.js",
                "args": {
                    "includeAll": true,
                    "method": route(this, this.selectMyGame)
                }
            }
        });
    };

    this.selectMyGame = function () {
        var countGameNotFinish = 0;
        if (bridge.args["fetchDb"].length > 0) {
            for (var i = 0; i < bridge.args["fetchDb"].length; i++) {
                if (bridge.args["fetchDb"][i]["value_data"]["gameState"] !== "finish") {
                    countGameNotFinish++;
                }
            }
            bridge.call("SetStateData", {
                "map": {
                    "countGameNotFinish": countGameNotFinish === 0 ? "" : countGameNotFinish
                }
            });
        }
    };

    this.createGame = function () {
        var gameUuid = bridge.call("Util", {"case": "uuid"})["uuid"];
        var gameData = {
            "game": bridge.args["game"],
            "gameUuid": gameUuid,
            "owner": bridge.unique,
        };
        gameDataExtend(gameData);
        newCreateGame(gameUuid, gameUuid, gameData);
    };

    this.requestConfirmCode = function () {
        if (bridge.state["main"]["CodeValue"] == undefined || bridge.state["main"]["CodeValue"].trim() === "") {
            bridge.alert("Код слишком пустой)");
        } else {
            bridge.call("Http", {
                "uri": "/GetCodeUuid",
                "body": {
                    "code": bridge.state["main"]["CodeValue"] * 1,
                },
                "onResponse": {
                    "jsRouter": "HomePage.ai.js",
                    "args": {
                        "includeAll": true,
                        "method": route(this, this.onConfirmCodeResponse)
                    }
                }
            });
        }
    };

    this.onConfirmCodeResponse = function () {
        if (bridge.checkHttpResponse([{
            error: "$.code: must have a minimum value of 100000",
            display: "Код должен быть 6 знаков"
        }])) {
            bridge.call("NavigatorPop", {});
            var socketUuid = bridge.args["httpResponse"]["data"]["data"]["uuid"];
            checkAlreadyGame(socketUuid);
        }
    };

    this.onGamePersist = function () {
        var socketUuid = bridge.args["socketUuid"];
        bridge.call("DbQuery", {
            "sql": "select * from data where (uuid_data = ? or parent_uuid_data = ?) and is_remove_data = 0 order by id_data desc",
            "args": [socketUuid, socketUuid],
            "onFetch": {
                "jsRouter": "HomePage.ai.js",
                "args": {
                    "includeAll": true,
                    "method": route(this, this.onSelectGame)
                }
            }
        });
    };

    this.onSelectGame = function () {
        bridge.call("Hide", {"case": "customLoader"});
        if (bridge.args["fetchDb"].length > 0) {
            var game = bridge.args["fetchDb"][0]["value_data"]["game"];
            var gameUuid = bridge.args["fetchDb"][0]["uuid_data"];
            var socketUuid = bridge.args["fetchDb"][0]["parent_uuid_data"];
            if (socketUuid == null || socketUuid === "" || socketUuid == undefined) {
                socketUuid = gameUuid;
            }
            bridge.call("NavigatorPush", getNavigatorPushGameArgs(gameUuid, socketUuid, game));
        } else {
            bridge.alert("Игра не найдена");
        }
    };

    this.onSelectGameCheckAlready = function () {
        if (bridge.args["fetchDb"].length > 0) {
            this.onSelectGame()
        } else {
            var gameUuid = bridge.call("Util", {"case": "uuid"})["uuid"];
            var socketUuid = bridge.args["socketUuid"];
            newCreateGame(gameUuid, socketUuid, {});
        }
    }
}

var objHomePageRouter = new HomePageRouter();

function gameDataExtend(gameData) {
    switch (gameData["game"]) {
        case "SecretConnections":
            gameData["runTeam"] = "red";
            gameData["gameState"] = "team"; //team/word/run/finish
            break;
        case "BattleOfMinds":
            gameData["runTeam"] = "red";
            gameData["gameState"] = "team"; //team/word/run/finish
            break;
    }
}

function newCreateGame(gameUuid, socketUuid, data) {
    bridge.call("Show", {"case": "customLoader"});
    bridge.call("DataSourceSet", {
        // В стандартном случае для сокетных данных посылается diff на сервер, а нам этого не надо
        // Хак (beforeSync=true)
        // Мы говорим, что эти данные пришли якобы с сервера и они просто заинсертятся в локальну БД
        // Таким образом новая сокетная запись при синхронизации уедет на сервер
        // Иначе мы будем получать ошибку, что НЕТ ДОСТУПА, так как данного uuid нет в удалённой БД
        // так как мы послыаем diff в отдельный end-point для сокетных данных
        "beforeSync": true,
        "updateIfExist": false,
        "uuid": gameUuid,
        "parent": socketUuid === gameUuid ? null : socketUuid,
        "value": data,
        "type": "socket",
        "debugTransaction": true,
        "key": "Game",
        "onPersist": {
            "jsRouter": "HomePage.ai.js",
            "args": {
                "includeAll": true,
                "gameUuid": gameUuid,
                "socketUuid": socketUuid,
                "method": route(objHomePageRouter, objHomePageRouter.onGamePersist)
            }
        }
    });
}

function checkAlreadyGame(socketUuid) {
    bridge.call("DbQuery", {
        "sql": "select * from data where (uuid_data = ? or parent_uuid_data = ?) and is_remove_data = 0 order by id_data desc",
        "args": [socketUuid, socketUuid],
        "onFetch": {
            "jsRouter": "HomePage.ai.js",
            "args": {
                "socketUuid": socketUuid,
                "includeAll": true,
                "method": route(objHomePageRouter, objHomePageRouter.onSelectGameCheckAlready)
            }
        }
    });
}

bridge.addRouter(objHomePageRouter);