if (bridge.args["switch"] == "constructor") {
    bridge.log("GAME constructor");
}

if (bridge.args["switch"] == "onChange") {
    var socketData = bridge.args["subscribe"]["data"];
    bridge.log(socketData);
    var newStateData = {};

    if (socketData["user" + bridge.unique] == undefined || socketData["user" + bridge.unique]["name"] == "") {
        newStateData["SwitchKey"] = "default";
    }
    if (socketData["user" + bridge.unique] != undefined) {
        newStateData["deviceName"] = socketData["user" + bridge.unique]["name"];
    }

    newStateData["originSocketData"] = socketData;
    newStateData["listPersonUndefined"] = getListPerson(socketData, "undefined");
    newStateData["listPersonRed"] = getListPerson(socketData, "red");
    newStateData["listPersonBlue"] = getListPerson(socketData, "blue");

    bridge.call('SetStateData', {
        "map": newStateData
    });
}

if (bridge.args["switch"] == "addPerson") {
    if (bridge.state["Name"] != undefined && bridge.state["Name"].trim() != "") {
        var data = {};
        userBlock = {
            name: bridge.state["Name"]
        };
        data["user" + bridge.call('Uuid', {})["uuid"]] = userBlock;
        socketSave(data);
        bridge.call("NavigatorPop", {});
    } else {
        bridge.alert("Имя слишком пустое)");
    }
}

if (bridge.args["switch"] == "setName") {
    //bridge.log();
    var data = {};
    var userBlock = {};
    var socketData = bridge.state["originSocketData"];
    if (socketData["user" + bridge.unique] != undefined) {
        userBlock = socketData["user" + bridge.unique];
    }
    userBlock["name"] = bridge.state["Name"];
    data["user" + bridge.unique] = userBlock;
    socketSave(data);
}

function socketSave(data) {
    var socketUuid = bridge.pageArgs["subscribeOnChangeUuid"]["list"][0];
    bridge.call('DataSourceSet', {
        "debugTransaction": true,
        "type": "socket",
        "uuid": socketUuid,
        "value": data
    });
}

function isOwner(socketData) {
    return socketData != undefined && socketData["owner"] == bridge.unique;
}

function getListPerson(socketData, team) {
    var result = [];
    var isOwn = isOwner(socketData);
    var listPerson = [];
    for (var key in socketData) {
        if (key.startsWith("user")) {
            socketData[key]["id"] = key;
            listPerson.push(socketData[key]);
        }
    }
    listPerson.sort(function(a, b) {
        return a["role"] == "captain" ? -1: 1;
    });
    for (var i = 0; i < listPerson.length; i++) {
        if (listPerson[i]["team"] == team
            || (listPerson[i]["team"] == undefined && team == "undefined")
        ) {
            var ami = listPerson[i]["id"] == ("user" + bridge.unique) ? "(Я) " : "";
            var isCaptain = listPerson[i]["role"] == "captain" ? "(Капитан) " : "";
            var background = "schema:onBackground";
            if (team == "red") {
                background = "red.600";
            }
            if (team == "blue") {
                background = "blue.600";
            }
            var iconColor = (team == "red" || team == "blue") ? "#ffffff" : "#999999";

            var onTap = isOwn ? {
                "sysInvoke": "NavigatorPush",
                "args": {
                    "subscribeOnChangeUuid": bridge.pageArgs["subscribeOnChangeUuid"],
                    "personKey": listPerson[i]["id"],
                    "personValue": listPerson[i],
                    "type": "BottomSheet",
                    "link": {
                        "template": "GamePersonEdit.json",
                    }
                }
            } : {};

            result.push({
                "label": ami + isCaptain + listPerson[i]["name"],
                "templateWidgetSrc": "ButtonIcon",
                "iconSrc": isOwn ? "edit" : "person_outline",
                "background": background,
                "iconColor": iconColor,
                "onTap": onTap
            });
        }
    }
    return result;
}

if (bridge.args["switch"] == "onRenderFloatingActionButton") {
    if (isOwner(bridge.state["originSocketData"])) {
        bridge.call("DataSourceSet", {
            "uuid": "FloatingActionButton.json",
            "type": "virtual",
            "value": {
                "flutterType": "FloatingActionButton",
                "child": {
                    "flutterType": "Icon",
                    "src": "add"
                },
                "onPressed": {
                    "sysInvoke": "NavigatorPush",
                    "args": {
                        "subscribeOnChangeUuid": bridge.pageArgs["subscribeOnChangeUuid"],
                        "type": "BottomSheet",
                        "link": {
                            "template": "GamePersonAdd.json",
                        }
                    }
                }
            }
        });
    }
}

if (bridge.args["switch"] == "savePerson") {
    if (bridge.state["Name"] != undefined && bridge.state["Name"].trim() != "") {
        var data = {};
        bridge.overlay(bridge.pageArgs["personValue"], {
            "name": bridge.state["Name"],
            "role": bridge.state["Role"],
            "team": bridge.state["Team"],
        });
        data[bridge.pageArgs["personKey"]] = bridge.pageArgs["personValue"];
        socketSave(data);
        bridge.call("NavigatorPop", {});
    } else {
        bridge.alert("Имя слишком пустое)");
    }
}

if (bridge.args["switch"] == "removePerson") {
    var data = {};
    data[bridge.pageArgs["personKey"]] = null;
    socketSave(data);
    bridge.call("NavigatorPop", {});
}

if (bridge.args["switch"] == "randomize") {
    var socketData = bridge.state["originSocketData"];
    var listPerson = [];
    for (var key in socketData) {
        if (key.startsWith("user")) {
            socketData[key]["id"] = key;
            listPerson.push(socketData[key]);
        }
    }
    listPerson = shuffle(listPerson);
    var data = {};
    for (var i = 0; i < listPerson.length; i++) {
        listPerson[i]["role"] = i < 2 ? "captain" : "player";
        listPerson[i]["team"] = i % 2 == 0 ? "red" : "blue";
        data[listPerson[i]["id"]] = listPerson[i];
        delete listPerson[i]["id"];
    }
    socketSave(data);
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}