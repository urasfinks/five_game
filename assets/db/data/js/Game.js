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
    newStateData["listPerson"] = getListPerson(socketData);
    newStateData["originSocketData"] = socketData;

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

function getListPerson(socketData) {
    var result = [];
    var count = 1;
    for (var key in socketData) {
        if (key.startsWith("user") && key != ("user" + bridge.unique)) {
            result.push({
                label: socketData[key]["name"],
                templateWidgetSrc: "ButtonIcon",
                iconSrc: "edit"
            });
        }
    }
    return result;
}

if (bridge.args["switch"] == "onRenderFloatingActionButton") {
    if (bridge.state["originSocketData"] != undefined && bridge.state["originSocketData"]["owner"] == bridge.unique) {
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
                            "template": "GameAddPerson.json",
                        }
                    }
                }
            }
        });
    }
}