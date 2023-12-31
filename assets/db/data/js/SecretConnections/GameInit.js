function SecretConnectionsGameInitRouter() {

    this.constructor = function () {
        constructGame(
            route(this, this.genCodeUuidResponse),
            route(this, this.onCheckSetUser),
        );
    }

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
    }

    this.genCodeUuidResponse = function () {
        if (bridge.checkHttpResponse([])) {
            socketSave({
                "gameCode": bridge.args["httpResponse"]["data"]["data"]["code"],
                "timestampCodeGenerate": bridge.util("timestamp", {})
            }, bridge.pageArgs["socketUuid"]);
        }
    }

    this.onChangeOrientation = function () {
        var socketData = bridge.state["main"]["originSocketData"];
        if (socketData != undefined && ["word", "run"].includes(socketData["gameState"])) {
            bridge.call("SetStateData", {
                "map": {
                    "gridWord": bridge.global.SecretConnections.getGridWord(socketData)
                }
            });
            controlBottomNavigationBar();
        }
    }

    this.onRenderFloatingActionButton = function () {
        var socketData = bridge.state["main"]["originSocketData"];
        onRenderFloatingActionButton(socketData, bridge.pageArgs["socketUuid"]);
    }

    this.destructor = function () {
        destructorGame();
    }
}

var objSecretConnectionsGameInitRouter = new SecretConnectionsGameInitRouter();

bridge.runRouter(objSecretConnectionsGameInitRouter);