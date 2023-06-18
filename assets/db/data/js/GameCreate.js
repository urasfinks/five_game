if (bridge.args["switch"] == "constructor") {
    try {
        console.log("constructor");
        if (bridge.state["game_code"] == undefined) {
            bridge.call('Http', {
                "uri": "/GenCodeUuid",
                "method": "GET",
                "body": {},
                "onResponse": {
                    "jsInvoke": "GameCreate.js",
                    "args": {
                        "includeStateData": true,
                        "switch": "GenCodeUuidResponse"
                    }
                }
            });
        }
    } catch (e) {
        console.log(e.toString());
    }
}

if (bridge.args["switch"] == "GenCodeUuidResponse") {
    if (bridge.args["httpResponse"]["status"] == false) {
        bridge.alert(bridge.args["httpResponse"]["error"]);
    } else {
        bridge.call('SetStateData', {
            "map": {
                "game_code": bridge.args["httpResponse"]["data"]["data"]["code"],
                "game_uuid": bridge.args["httpResponse"]["data"]["data"]["uuid"]
            }
        });
        bridge.call('DataSourceSet', {
            "uuid": bridge.args["httpResponse"]["data"]["data"]["uuid"],
            "value": {},
            "parent": null,
            "type": "socket",
            "key": null,
            "onPersist": {
                "jsInvoke": "GameCreate.js",
                "args": {
                    "switch": "SocketDataAdd"
                }
            }
        });
        //bridge.alert(JSON.stringify());
    }
}

if (bridge.args["switch"] == "SocketDataAdd") {
    console.log("SocketDataAdd!");
}