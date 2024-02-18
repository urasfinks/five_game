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

    this.changeGroup = function () {
        var socketData = bridge.state["main"]["originSocketData"];
        bridge.call("NavigatorPush", {
            "flutterType": "Notify",
            "link": {
                "template": "ListItem.json"
            },
            "data": {
                "title": "Группы",
                "theme": "ListSimple",
                "listItem": socketData["availableGroup"] || [],
                "placeholder": "Название новой группы"
            },
            "onSave": {
                "jsRouter": "BattleOfMinds/GameTeam.ai.js",
                "args": {
                    "changeContext": bridge.pageUuid,
                    "method": "onSaveGroup"
                }
            },
            "context": {
                "key": "changeGroup",
                "data": {
                    "template": {
                        "flutterType": "Scaffold",
                        "appBar": {
                            "flutterType": "AppBar",
                            "title": {
                                "flutterType": "Text",
                                "label": ""
                            }
                        }
                    }
                }
            }
        });
    };

    this.onSaveGroup = function () {
        //bridge.log(bridge.args);
        //{"changeContext":"24760aa7-0901-4133-81ba-b28b4d60ad77","method":"onSaveGroup","list":[{"label":"Новый 1"},{"label":"Прии"}]}
        socketSave({
            "availableGroup": bridge.args["list"]
        }, bridge.pageArgs["socketUuid"]);
    };

    this.onChangeThemeGame = function () {
        socketSave({"themeGameLabel": bridge.args["selected"]["label"]}, bridge.pageArgs["socketUuid"]);
    };

    this.removePerson = function () {
        //TODO: сделать проверку что персона статичная
        var data = {};
        data["user" + bridge.pageArgs["personId"]] = null;
        socketSave(data, bridge.pageArgs["socketUuid"]);
        bridge.call("NavigatorPop", {});
    };

    this.getListPersonByType = function (listPerson, isStatic) {
        var result = [];
        for (var i = 0; i < listPerson.length; i++) {
            if (isStatic === true) {
                if (listPerson[i]["static"] === true) {
                    result.push(listPerson[i]);
                }
            } else {
                if (listPerson[i]["static"] == undefined || listPerson[i]["static"] === false) {
                    result.push(listPerson[i]);
                }
            }

        }
        return result;
    };

    this.randomize = function () {
        var socketData = bridge.state["main"]["originSocketData"];
        var group = socketData["availableGroup"];
        var listPerson = bridge.shuffle(getListPerson(socketData));
        var data = {};
        for (var i = 0; i < listPerson.length; i++) {
            listPerson[i]["team"] = "";
            data["user" + listPerson[i]["id"]] = listPerson[i];
        }
        if (group.length > 0) {
            var listPersonStatic = this.getListPersonByType(listPerson, true);
            var listPersonReal = this.getListPersonByType(listPerson, false);
            listPersonReal = listPersonReal.concat(listPersonStatic);
            for (var i = 0; i < listPersonReal.length; i++) {
                listPersonReal[i]["team"] = group[i % group.length].label;
                data["user" + listPersonReal[i]["id"]] = listPersonReal[i];
            }
        }
        socketSave(data, bridge.pageArgs["socketUuid"]);
    };

    this.addPerson = function () {
        if (bridge.state["main"]["Name"] != undefined && bridge.state["main"]["Name"].trim() !== "") {
            var data = {};
            var uuidPerson = bridge.call("Util", {"case": "uuid"})["uuid"];
            data["user" + uuidPerson] = {
                "name": bridge.state["main"]["Name"],
                "id": uuidPerson,
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