function BattleOfMindsGameInitRouter() {

    this.constructor = function () {
        constructGame(
            route(this, this.genCodeUuidResponse),
            route(this, this.onCheckSetUser),
        );
        this.updateAvailableThemeGame();
    };

    this.updateAvailableThemeGame = function () {
        bridge.call("DbQuery", {
            "sql": "select * from data where key_data = ? and is_remove_data = 0 order by meta_data asc",
            "args": ["BattleOfMindsThemeGame"],
            "onFetch": {
                "jsRouter": "BattleOfMinds/GameInit.ai.js",
                "args": {
                    "method": route(this, this.onSelectThemeGame)
                }
            }
        });
    };

    this.onSelectThemeGame = function () {
        if (bridge.args["fetchDb"].length > 0) {
            var list = [], fetchDb = bridge.args["fetchDb"];
            for (var i = 0; i < fetchDb.length; i++) {
                list.push({
                    "label": fetchDb[i]["value_data"]["label"],
                    "uuid": fetchDb[i]["uuid_data"]
                });
            }
            bridge.call("SetStateData", {
                "state": "availableThemeGame",
                "map": {
                    "listOptions": list
                }
            });
            //Дополнительно кинем фейковое событие, что бы перерисовался сам SelectSheet
            bridge.call("SetStateData", {
                //"state": "groupWord",
                "map": {
                    "_": bridge.util("uuid", {})
                }
            });
        }
    };

    this.onCheckSetUser = function () {
        if (bridge.args["fetchDb"].length > 0) {
            var socketData = bridge.args["fetchDb"][0]["value_data"];
            if (socketData["user" + bridge.unique] == undefined) {
                //Если нет данных об этом устройстве - добавим
                var data = {};
                var accName = bridge.getStorage("accountName", "Укажите своё имя");
                if (accName == undefined || accName === "" || accName.trim() === "") {
                    accName = "Укажите своё имя";
                }
                data["user" + bridge.unique] = {
                    name: accName,
                    id: bridge.unique,
                    static: false,
                    team: "",
                    role: "player"
                };
                socketSave(data, bridge.pageArgs["socketUuid"]);
            }
        }
    };

    this.genCodeUuidResponse = function () {
        if (bridge.checkHttpResponse([])) {
            socketSave({
                "gameCode": bridge.args["httpResponse"]["data"]["data"]["code"],
                "timestampCodeGenerate": bridge.util("timestamp", {})
            }, bridge.pageArgs["socketUuid"]);
        }
    };

    this.onChangeOrientation = function () {
        var socketData = bridge.state["main"]["originSocketData"];
        if (socketData != undefined && ["word", "run"].includes(socketData["gameState"])) {
            controlBottomNavigationBar();
        }
    };

    this.onRenderFloatingActionButton = function () {
        var socketData = bridge.state["main"]["originSocketData"];
        onRenderFloatingActionButton(socketData, bridge.pageArgs["socketUuid"]);
    };

    this.destructor = function () {
        destructorGame();
    };
}

bridge.addRouter(new BattleOfMindsGameInitRouter());