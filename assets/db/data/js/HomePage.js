if (bridge.args["switch"] === "constructor") {

    bridge.asyncImport("GameFunction.js", {});

    bridge.call("DbQuery", {
        "sql": "select * from data where key_data = ? and is_remove_data = 0 order by id_data desc",
        "args": ["Game"],
        "onFetch": {
            "jsInvoke": "HomePage.js",
            "args": {
                "includeAll": true,
                "switch": "selectMyGame"
            }
        }
    });
}

if (bridge.args["switch"] === "selectMyGame") {
    var countGameNotFinish = 0;
    if (bridge.args["fetchDb"].length > 0) {
        for (var i = 0; i < bridge.args["fetchDb"].length; i++) {
            if (bridge.args["fetchDb"][i]["value_data"]["gameState"] !== "finish") {
                countGameNotFinish++;
            }
        }
        bridge.call("SetStateData", {
            "map": {
                "countGameNotFinish": countGameNotFinish == 0 ? "" : countGameNotFinish
            }
        });
    }
}

if (bridge.args["switch"] === "createGame") {
    var uuid = bridge.call("Util", {"case": "uuid"})["uuid"];
    gameData = {
        "description": "CodeNames",
        "gameUuid": uuid,
        "owner": bridge.unique,
        "runTeam": "red",
        "gameState": "team", //team/word/run/finish
    };
    gameData["user" + bridge.unique] = {
        "name": bridge.call("GetStorage", {"key": "accountName", "default": ""})["accountName"],
        "team": "undefined",
        "role": "player",
        "id": bridge.unique,
        "static": false
    };
    bridge.call("DataSourceSet", {
        // Хак, для сокетных данных, которые необходимо заинсертит в локальную БД
        // В стандартном случае посылается diff на сервер, а нам этого не надо
        // Таким образом новая сокетная запись при синхронизации уедет на сервер
        // Иначе мы будем получать ошибку, что НЕТ ДОСТУПА, так как данного uuid нет в удалённой БД
        "beforeSync": true,
        "updateIfExist": false,
        "uuid": uuid,
        "value": gameData,
        "parent": null,
        "type": "socket",
        "debugTransaction": true,
        "key": "Game",
        "onPersist": {
            "jsInvoke": "HomePage.js",
            "args": {
                "includeAll": true,
                "gameUuid": uuid,
                "switch": "gameSaveToDb"
            }
        }
    });
}

if (bridge.args["switch"] === "gameSaveToDb") {
    bridge.call("NavigatorPush", getNavigatorPushGameArgs(bridge.args["gameUuid"], bridge.args["gameUuid"]));
}

if (bridge.args["switch"] === "requestConfirmCode") {
    if (bridge.state["main"]["CodeValue"] == undefined || bridge.state["main"]["CodeValue"].trim() === "") {
        bridge.alert("Код слишком пустой)");
    } else {
        bridge.call("Http", {
            "uri": "/GetCodeUuid",
            "body": {
                "code": bridge.state["main"]["CodeValue"] * 1,
            },
            "onResponse": {
                "jsInvoke": "HomePage.js",
                "args": {
                    "includeAll": true,
                    "switch": "onConfirmCodeResponse"
                }
            }
        });
    }
}

if (bridge.args["switch"] === "onConfirmCodeResponse") {
    if (bridge.checkHttpResponse([{
        error: "$.code: must have a minimum value of 100000",
        display: "Код должен быть 6 знаков"
    }])) {
        var socketUuid = bridge.args["httpResponse"]["data"]["data"]["uuid"];
        bridge.call("DbQuery", {
            "sql": "select * from data where uuid_data = ? or parent_uuid_data = ? order by id_data desc",
            "args": [socketUuid, socketUuid],
            "onFetch": {
                "jsInvoke": "HomePage.js",
                "args": {
                    "socketUuid": socketUuid,
                    "includeAll": true,
                    "closeBottomSheet": true,
                    "switch": "selectAllReadyGame"
                }
            }
        });
    }
}

if (bridge.args["switch"] === "selectAllReadyGame") {
    //Эта штука для DeepLink сделана, что бы окно последнее не закрывать, так как ничего не открывалось
    var closeBottomSheet = bridge.args["closeBottomSheet"] || true;
    var socketUuid = bridge.args["socketUuid"];
    if (bridge.args["fetchDb"].length > 0) {
        var fetch = bridge.args["fetchDb"][0];
        closeThisPageAndOpenGame(socketUuid, fetch["uuid_data"], closeBottomSheet);
    } else {
        var gameUuid = bridge.call("Util", {"case": "uuid"})["uuid"];
        bridge.call("DataSourceSet", {
            // Хак, для сокетных данных, которые необходимо заинсертит в локальную БД
            // В стандартном случае посылается diff на сервер, а нам этого не надо
            // Таким образом новая сокетная запись при синхронизации уедет на сервер
            // Иначе мы будем получать ошибку, что НЕТ ДОСТУПА, так как данного uuid нет в удалённой БД
            "beforeSync": true,
            "updateIfExist": false,
            "uuid": gameUuid,
            "value": {},
            "parent": socketUuid,
            "type": "socket",
            "debugTransaction": true,
            "key": "Game",
            "onPersist": {
                "jsInvoke": "HomePage.js",
                "args": {
                    "includeAll": true,
                    "socketUuid": socketUuid,
                    "gameUuid": gameUuid,
                    "closeBottomSheet": closeBottomSheet,
                    "switch": "gameConnectSaveToDb"
                }
            }
        });
    }
}

if (bridge.args["switch"] === "gameConnectSaveToDb") {
    closeThisPageAndOpenGame(bridge.args["socketUuid"], bridge.args["gameUuid"], bridge.args["closeBottomSheet"]);
}

function closeThisPageAndOpenGame(socketUuid, gameUuid, closeBottomSheet) {
    if (closeBottomSheet) {
        bridge.call("NavigatorPop", {});
    }
    bridge.call("NavigatorPush", getNavigatorPushGameArgs(gameUuid, socketUuid));
}

function getNavigatorPushGameArgs(gameUuid, socketUuid) {
    return {
        "uuid": "Game.json",
        "gameUuid": gameUuid,
        "socketUuid": socketUuid,
        "socket": true,
        "subscribeOnChangeUuid": [gameUuid],
        "constructor": {
            "jsInvoke": "GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "constructor"
            }
        },
        "onChangeUuid": {
            "jsInvoke": "Game.js",
            "args": {
                "includeAll": true,
                "switch": "onChange"
            }
        },
        "onChangeOrientation": {
            "jsInvoke": "GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "onChangeOrientation"
            }
        },
        "destructor": {
            "jsInvoke": "GameInit.js",
            "args": {
                "switch": "destructor"
            }
        },
        "onActive": {
            "jsInvoke": "GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "onChangeOrientation"
            }
        },
        "onRenderFloatingActionButton": {
            "jsInvoke": "GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "onRenderFloatingActionButton"
            }
        }
    };
}