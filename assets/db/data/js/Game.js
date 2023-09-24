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
        var timestampCodeGenerate = socketData["timestampCodeGenerate"] || 0;
        var curTimestamp = bridge.util("timestamp", {});
        var isOwn = isOwner(socketData);

        if (isOwn && ["team"].includes(curGameState) && curTimestamp > (timestampCodeGenerate + (300 * 1000))) {
            bridge.log("timestampCodeGenerate: " + timestampCodeGenerate + "; curTimestamp: " + curTimestamp);
            bridge.call("Http", {
                "uri": "/GenCodeUuid",
                "method": "POST",
                "body": {
                    "uuid": socketUuid
                },
                "onResponse": {
                    "jsInvoke": "Game.js",
                    "args": {
                        "includeAll": true,
                        "switch": "GenCodeUuidResponse"
                    }
                }
            });
        }

        if (socketData["user" + bridge.unique] != undefined) {
            newStateData["deviceName"] = socketData["user" + bridge.unique]["name"];
        } else {
            //Если нет данных об этом устройстве - добавим
            var data = {};
            data["user" + bridge.unique] = {
                name: bridge.getStorage("accountName", "Новый игрок"),
                id: bridge.unique,
                "static": false,
                "team": "",
                "role": "player"
            };
            socketSave(data, socketUuid);
        }
        if (["team"].includes(curGameState)) {
            newStateData["toWordGameState"] = getFlagToWordGameState(socketData);
            // Так как код для подключения истекает каждые 5 минут будем передёргивать страницу каждые 5 минут 10 секунд
            // ЧТо бы заново сгенерировать код для подключения
            bridge.call("Util", {"case": "dynamicPageApi", "api": "startReloadEach", "eachReload": 310});
        } else {
            bridge.call("Util", {"case": "dynamicPageApi", "api": "stopReloadEach"});
        }
        if (["word", "run", "finish"].includes(curGameState)) {
            if (isOwner(socketData)) {
                newStateData["visibleGenerateWord"] = "true";
            }
            newStateData["gridWord"] = getGridWord(socketData);
        }
        if (["run", "finish"].includes(curGameState)) {
            calculateScore(socketData, newStateData, socketUuid);
            newStateData["users"] = getUsers(socketData);
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
            listPersonUndefined: getListPersonGroup(socketData, "undefined", socketUuid),
            listPersonRed: getListPersonGroup(socketData, "red", socketUuid),
            listPersonBlue: getListPersonGroup(socketData, "blue", socketUuid),
            toNextTeam: (isCaptain(socketData) && isMyGame(socketData)) ? "true" : "false",
            socketUuid: socketUuid,
            gameCode: socketData["gameCode"] || "...",
            isOwner: isOwn,
            toNextRun: toNextRun
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
    if (curGameState === "run") {
        bridge.socketExtend({
            "action": "timestamp",
            "arguments": {
                "field": "session"
            }
        }, socketUuid);
    }
}

if (bridge.args["switch"] === "GenCodeUuidResponse") {
    if (bridge.checkHttpResponse([])) {
        socketSave({
            "gameCode": bridge.args["httpResponse"]["data"]["data"]["code"],
            "timestampCodeGenerate": bridge.util("timestamp", {})
        }, bridge.pageArgs["socketUuid"]);
    }
}