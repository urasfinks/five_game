function BattleOfMindsGameRunRouter() {

    this.toNextTeam = function () {
        var socketData = bridge.state["main"]["originSocketData"];
        var newSocketUpdate = {};
        bridge.global.BattleOfMinds.clearAllSelected(socketData, newSocketUpdate);
        bridge.global.BattleOfMinds.toggleTeam(socketData, newSocketUpdate);
        socketSave(newSocketUpdate, bridge.pageArgs["socketUuid"]);
        bridge.socketExtend({
            "action": "timestamp",
            "arguments": {
                "field": "session"
            }
        }, bridge.pageArgs["socketUuid"]);
    };

    this.confirmSelect = function () {
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
        if (card["team"] === "die") {
            newSocketUpdate["gameState"] = "finish";
            newSocketUpdate["finishDescription"] = "Выбрана чёрная карта." +
                ". Выиграла " + (socketData["runTeam"] === "blue" ? "красная" : "синяя") +
                " команда";
            bridge.global.BattleOfMinds.clearAllSelected(socketData, newSocketUpdate);
        } else if (card["team"] !== myTeam) {
            bridge.global.BattleOfMinds.clearAllSelected(socketData, newSocketUpdate);
            bridge.global.BattleOfMinds.toggleTeam(socketData, newSocketUpdate);
        }
        card["selected"] = socketData["runTeam"];
        newSocketUpdate["card" + indexCard] = card;

        socketSave(newSocketUpdate, bridge.pageArgs["socketUuid"]);
    };

    this.onCardTap = function () {
        var data = {};
        var key = "tapCard_" + bridge.args["index"] + "_" + bridge.unique;
        data[key] = bridge.state["main"]["originSocketData"][key] == undefined ? true : null;
        socketSave(data, bridge.pageArgs["socketUuid"]);
    };
}

bridge.addRouter(new BattleOfMindsGameRunRouter());