if (bridge.args["switch"] === "addPerson") {
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
}

if (bridge.args["switch"] === "randomize") {
    var socketData = bridge.state["main"]["originSocketData"];
    var listPerson = bridge.shuffle(getListPerson(socketData));
    var data = {};
    var countCaptain = 0;
    var listNotCaptain = [];
    for (var i = 0; i < listPerson.length; i++) {
        var isStatic = listPerson[i]["static"] || false;
        if (isStatic === true) {
            listNotCaptain.push(listPerson[i]);
        } else {
            if (countCaptain == 0 || countCaptain == 1) {
                listPerson[i]["role"] = "captain";
                listPerson[i]["team"] = countCaptain === 0 ? "red" : "blue";
                countCaptain++;
                data["user" + listPerson[i]["id"]] = listPerson[i];
            } else {
                listNotCaptain.push(listPerson[i]);
            }
        }
    }
    for (var i = 0; i < listNotCaptain.length; i++) {
        listNotCaptain[i]["team"] = i % 2 == 0 ? "red" : "blue";
        data["user" + listNotCaptain[i]["id"]] = listNotCaptain[i];
    }
    bridge.log("randomize: " + JSON.stringify(data));
    socketSave(data, bridge.pageArgs["socketUuid"]);
}

if (bridge.args["switch"] === "removePerson") {
    //TODO: сделать проверку что персона статичная
    var data = {};
    data["user" + bridge.pageArgs["personId"]] = null;
    socketSave(data, bridge.pageArgs["socketUuid"]);
    bridge.call("NavigatorPop", {});
}

if (bridge.args["switch"] === "savePerson") {
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
}

if (bridge.args["switch"] === "setName") {
    var data = {};
    var userBlock = {};
    var socketData = bridge.state["main"]["originSocketData"];
    if (socketData["user" + bridge.unique] != undefined) {
        userBlock = socketData["user" + bridge.unique];
    }
    userBlock["name"] = bridge.state["main"]["Name"];
    data["user" + bridge.unique] = userBlock;
    socketSave(data, bridge.pageArgs["socketUuid"]);
}