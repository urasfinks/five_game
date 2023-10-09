if (bridge.args["switch"] === "toNextTeam") {
    var socketData = bridge.state["main"]["originSocketData"];
    var newSocketUpdate = {};
    clearAllSelected(socketData, newSocketUpdate);
    toggleTeam(socketData, newSocketUpdate);
    socketSave(newSocketUpdate, bridge.pageArgs["socketUuid"]);
    bridge.socketExtend({
        "action": "timestamp",
        "arguments": {
            "field": "session"
        }
    }, socketUuid);
}

if (bridge.args["switch"] === "confirmSelect") {
    var socketData = bridge.state["main"]["originSocketData"];
    var newSocketUpdate = {};
    var myTeam = getMyTeam(socketData);
    var indexCard = bridge.args["indexCard"];
    var card = socketData["card" + indexCard];
    //В карту заносим юзеров, кто выбрал её
    if (card["userPress"] == undefined) {
        card["userPress"] = [];
    }
    for (var key in socketData) {
        if (key.startsWith("tapCard_")) {
            var curIndexCard = key.split("tapCard_")[1].split("_")[0];
            if (indexCard == curIndexCard) {
                card["userPress"].push(key.split("_").pop());
            }
        }
    }
    //--
    if (card["team"] === "die") {
        newSocketUpdate["gameState"] = "finish";
        newSocketUpdate["finishDescription"] = "Выбрана чёрная карта." +
            ". Выиграла " + (socketData["runTeam"] === "blue" ? "красная" : "синяя") +
            " команда";
        clearAllSelected(socketData, newSocketUpdate);
    } else if (card["team"] !== myTeam) {
        clearAllSelected(socketData, newSocketUpdate);
        toggleTeam(socketData, newSocketUpdate);
    }
    card["selected"] = socketData["runTeam"];
    newSocketUpdate["card" + indexCard] = card;

    socketSave(newSocketUpdate, bridge.pageArgs["socketUuid"]);
}

function toggleTeam(socketData, newSocketUpdate) {
    newSocketUpdate["runTeam"] = socketData["runTeam"] === "blue" ? "red" : "blue";
}

function clearAllSelected(socketData, newSocketUpdate) {
    for (var key in socketData) {
        if (key.startsWith("tapCard_")) {
            newSocketUpdate[key] = null;
        }
    }
}

if (bridge.args["switch"] === "onCardTap") {
    var data = {};
    var key = "tapCard_" + bridge.args["index"] + "_" + bridge.unique;
    data[key] = bridge.state["main"]["originSocketData"][key] == undefined ? true : null;
    socketSave(data, bridge.pageArgs["socketUuid"]);
}