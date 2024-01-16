function BattleOfMindsGameTeamRouter() {

    this.onPop = function () {
        bridge.log("ONPOP: " + JSON.stringify(bridge.args["selected"]));
    };

    this.setName = function () {
        var data = {};
        var userBlock = {};
        var socketData = bridge.state["main"]["originSocketData"];
        if (socketData["user" + bridge.unique] != undefined) {
            userBlock = socketData["user" + bridge.unique];
        }
        userBlock["name"] = bridge.state["main"]["Name"];
        data["user" + bridge.unique] = userBlock;
        socketSave(data, bridge.pageArgs["socketUuid"]);
    };

    this.savePerson = function () {
        if (bridge.state["main"]["Name"] != undefined && bridge.state["main"]["Name"].trim() !== "") {
            var data = {};
            bridge.overlay(bridge.pageArgs["personValue"], {
                "name": bridge.state["main"]["Name"] || "Гость",
                "role": bridge.state["main"]["Role"] || "player",
                "team": bridge.state["main"]["Team"] || "undefined",
            });
            data["user" + bridge.pageArgs["personId"]] = bridge.pageArgs["personValue"];
            socketSave(data, bridge.pageArgs["socketUuid"]);
            bridge.call("NavigatorPop", {});
        } else {
            bridge.alert("Имя слишком пустое)");
        }
    };

    this.removePerson = function(){
        //TODO: сделать проверку что персона статичная
        var data = {};
        data["user" + bridge.pageArgs["personId"]] = null;
        socketSave(data, bridge.pageArgs["socketUuid"]);
        bridge.call("NavigatorPop", {});
    };

    this.randomize = function(){
        var socketData = bridge.state["main"]["originSocketData"];
        var listPerson = groupFirstRealPerson(bridge.shuffle(getListPerson(socketData)));
        var data = {};
        var countCaptain = 0;
        for (var i = 0; i < listPerson.length; i++) {
            if (i === 0 || i === 1) {
                listPerson[i]["role"] = "captain";
                listPerson[i]["team"] = countCaptain++ === 0 ? "red" : "blue";
            } else {
                listPerson[i]["role"] = "player";
                listPerson[i]["team"] = i % 2 == 0 ? "red" : "blue";
            }
            data["user" + listPerson[i]["id"]] = listPerson[i];
        }
        socketSave(data, bridge.pageArgs["socketUuid"]);
    };

    this.addPerson = function(){
        if (bridge.state["main"]["Name"] != undefined && bridge.state["main"]["Name"].trim() !== "") {
            var data = {};
            var uuidPerson = bridge.call("Util", {"case": "uuid"})["uuid"];
            data["user" + uuidPerson] = {
                name: bridge.state["main"]["Name"],
                id: uuidPerson,
                "static": true,
                "team": "",
                "role": "player"
            };
            socketSave(data, bridge.pageArgs["socketUuid"]);
            bridge.call("NavigatorPop", {});
        } else {
            bridge.alert("Имя слишком пустое)");
        }
    };
}

bridge.addRouter(new BattleOfMindsGameTeamRouter());