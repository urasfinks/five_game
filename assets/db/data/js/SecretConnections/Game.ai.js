function SecretConnectionsGameRouter() {

    this.onChange = function () {
        // onChange - вызывается после изменения сокетных данных
        // Низя в этом обработчике вызывать socketSave - так как это может привести к зацикливанию
        // Уже так было когда сервер выдавал ошибку мы просто раскручивались в рекурсии
        if (bridge.args["data"] == undefined || bridge.args["data"] == null) {
            bridge.call("SetStateData", {
                "map": {
                    "switchKey": "error"
                }
            });
        } else {
            var newStateData = {};
            var lastGameState = bridge.state["main"]["originSocketData"] != undefined ? bridge.state["main"]["originSocketData"]["gameState"] : "";
            var socketData = bridge.args["data"];
            var curGameState = socketData["gameState"];
            var socketUuid = bridge.pageArgs["socketUuid"];
            var isOwn = isOwner(socketData);

            if (socketData["user" + bridge.unique] != undefined) {
                newStateData["deviceName"] = socketData["user" + bridge.unique]["name"];
            } else {
                //Если нет данных об этом устройстве - добавим
                newStateData["deviceName"] = "Укажите своё имя";
            }
            if (["team"].includes(curGameState)) {
                bridge.global.SecretConnections.getFlagToWordGameState(socketData, newStateData);
            } else {
                bridge.call("Util", {"case": "dynamicPageApi", "api": "stopReloadEach"});
            }
            if (["word", "run", "finish"].includes(curGameState)) {
                if (isOwner(socketData)) {
                    newStateData["visibleGenerateWord"] = "true";
                }
                newStateData["gridWord"] = bridge.global.SecretConnections.getGridWord(socketData);
            }
            if (["run", "finish"].includes(curGameState)) {
                bridge.global.SecretConnections.calculateScore(socketData, newStateData, socketUuid);
                newStateData["users"] = bridge.global.SecretConnections.getUsers(socketData);
            }
            if (lastGameState !== curGameState) {
                onRenderFloatingActionButton(socketData, socketUuid);
            }
            var toNextRun = false;
            if (isOwn && socketData["isGeneratedCard"] === true) {
                toNextRun = true;
            }
            bridge.overlay(newStateData, {
                switchKey: curGameState,
                originSocketData: socketData,
                listPersonUndefined: bridge.global.SecretConnections.getListPersonGroup(socketData, "undefined", socketUuid),
                listPersonRed: bridge.global.SecretConnections.getListPersonGroup(socketData, "red", socketUuid),
                listPersonBlue: bridge.global.SecretConnections.getListPersonGroup(socketData, "blue", socketUuid),
                toNextTeam: (isCaptain(socketData) && isMyGame(socketData)) ? "true" : "false",
                socketUuid: socketUuid,
                gameCode: socketData["gameCode"] || "...",
                isOwner: isOwn,
                toNextRun: toNextRun
            });
            if (socketData["groupWordLabel"] != undefined) {
                newStateData["groupWordLabel"] = socketData["groupWordLabel"]
            }
            bridge.call("SetStateData", {
                "cause": "Game.ai.js::onChange",
                "map": newStateData
            });
        }
    }

    this.changeGameState = function () {//team/word/run/finish
        var curGameState = bridge.args["gameState"];
        var socketUuid = bridge.pageArgs["socketUuid"];
        socketSave({
            "gameState": curGameState
        }, socketUuid);
        bridge.socketExtend({
            "action": "timestamp",
            "arguments": {
                "field": curGameState
            }
        }, socketUuid);
        if (curGameState === "run") {
            bridge.socketExtend({
                "action": "timestamp",
                "arguments": {
                    "field": "session"
                }
            }, socketUuid);
        }
    }
}

var objSecretConnectionsGameRouter = new SecretConnectionsGameRouter();

bridge.addRouter(objSecretConnectionsGameRouter);