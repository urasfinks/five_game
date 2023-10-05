if (bridge.args["switch"] === "toNextTeam") {
    var socketData = bridge.state["main"]["originSocketData"];
    var newSocketUpdate = {};
    for (var key in socketData) {
        if (key.startsWith("tapCard_")) {
            var curIndexCard = key.split("tapCard_")[1].split("_")[0];
            newSocketUpdate[key] = null;
            var card = newSocketUpdate["card" + curIndexCard] || socketData["card" + curIndexCard];
            if (card["userPress"] == undefined) {
                card["userPress"] = [];
            }
            if (card["team"] === "black") {
                newSocketUpdate["gameState"] = "finish";
                newSocketUpdate["description"] = "Выбрана чёрная карта." +
                    ". Выиграла " + (socketData["runTeam"] === "blue" ? "красная" : "синяя") +
                    " команда";
            }
            card["userPress"].push(key.split("_").pop());
            card["selected"] = socketData["runTeam"];
            newSocketUpdate["card" + curIndexCard] = card;
        }
    }
    newSocketUpdate["runTeam"] = socketData["runTeam"] === "blue" ? "red" : "blue";
    socketSave(newSocketUpdate, bridge.pageArgs["socketUuid"]);
    bridge.socketExtend({
        "action": "timestamp",
        "arguments": {
            "field": "session"
        }
    }, socketUuid);
}

if (bridge.args["switch"] === "onCardTap") {
    var data = {};
    var key = "tapCard_" + bridge.args["index"] + "_" + bridge.unique;
    data[key] = bridge.state["main"]["originSocketData"][key] == undefined ? true : null;
    socketSave(data, bridge.pageArgs["socketUuid"]);
}