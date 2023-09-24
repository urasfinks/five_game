if (bridge.args["switch"] === "onChange") {
    bridge.log(bridge.args["data"]);
    if (bridge.args["data"] === undefined || bridge.args["data"] === null) {
        bridge.call("SetStateData", {
            "map": {switchKey: "error"}
        });
    } else {
        var newStateData = {};
        var lastGameState = bridge.state["main"]["originSocketData"] != undefined ? bridge.state["main"]["originSocketData"]["gameState"] : "";
        var socketData = bridge.args["data"];
        var curGameState = socketData["gameState"];
        var socketUuid = bridge.pageArgs["socketUuid"];

        if (socketData["user" + bridge.unique] != undefined) {
            newStateData["deviceName"] = socketData["user" + bridge.unique]["name"];
        }
        if (["team"].includes(curGameState)) {
            newStateData["toWordGameState"] = getFlagToWordGameState(socketData);
            // Так как код для подключения истекает каждые 5 минут будем передёргивать страницу каждые 5 минут 10 секунд
            // ЧТо бы заново сгенерировать код для подключения
            bridge.call("Util", {"case": "dynamicPageApi", "api": "startReloadEach", "eachReload": 310});
        } else {
            bridge.call("Util", {"case": "dynamicPageApi", "api": "stopReloadEach"});
        }
        if (["word", "run"].includes(curGameState)) {
            if (isOwner(socketData)) {
                newStateData["visibleGenerateWord"] = "true";
            }
            newStateData["gridWord"] = getGridWord(socketData);
        }
        if (["run", "finish"].includes(curGameState)) {
            calculateScore(socketData, newStateData);
            newStateData["users"] = getUsers(socketData);
        }
        if (lastGameState !== curGameState) {
            onRenderFloatingActionButton(socketData, socketUuid);
        }
        bridge.overlay(newStateData, {
            switchKey: curGameState,
            originSocketData: socketData,
            listPersonUndefined: getListPersonGroup(socketData, "undefined", socketUuid),
            listPersonRed: getListPersonGroup(socketData, "red", socketUuid),
            listPersonBlue: getListPersonGroup(socketData, "blue", socketUuid),
            toNextTeam: (isCaptain(socketData) && isMyGame(socketData)) ? "true" : "false",
            socketUuid: socketUuid
        });
        //bridge.log(newStateData);
        bridge.call("SetStateData", {
            "map": newStateData
        });
    }
}

if (bridge.args["switch"] === "changeGameState") { //team/word/run/finish
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
}