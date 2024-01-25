function BattleOfMindsGameTeamRouter() {

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
                "team": bridge.selector(bridge.state, ["groupPerson", "groupPerson", "label"], "undefined"),
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