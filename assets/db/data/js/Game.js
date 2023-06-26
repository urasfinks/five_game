if (bridge.args["switch"] == "constructor") {
    bridge.log("GAME constructor");
}

if (bridge.args["switch"] == "onChange") {
    var data = bridge.args["subscribe"]["data"];
    bridge.log(data);
    var newStateData = {};

    if (data["user" + bridge.unique] == undefined || data["user" + bridge.unique]["name"] == "") {
        newStateData["SwitchKey"] = "default";
    }
    if (data["user" + bridge.unique] != undefined) {
        newStateData["deviceName"] = data["user" + bridge.unique]["name"];
    }
    bridge.call('SetStateData', {
        "map": newStateData
    });
}

if (bridge.args["switch"] == "setName") {
    //bridge.log();
    var data = {};
    data["user" + bridge.unique] = {
        "name": bridge.state["Name"]
    }
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