if (bridge.args["switch"] == "constructor") {
    //bridge.log("constructor");
    try {
        if (bridge.state["main"]["game_code"] == undefined) {
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
        bridge.log(e.toString());
    }
}

if (bridge.args["switch"] == "GenCodeUuidResponse") {
    if (bridge.args["httpResponse"]["status"] == false) {
        bridge.alert(bridge.args["httpResponse"]["error"]);
    } else {
        bridge.call('SetStateData', {
            "map": {
                "gameCode": bridge.args["httpResponse"]["data"]["data"]["code"],
                "gameUuid": bridge.args["httpResponse"]["data"]["data"]["uuid"]
            }
        });
        var value = {
            "gameCode": bridge.args["httpResponse"]["data"]["data"]["code"],
            "gameUuid": bridge.args["httpResponse"]["data"]["data"]["uuid"],
            "owner": bridge.unique,
            "runTeam": "red",
            "gameState": "team", //team/word/run/finish

        };
        value["user" + bridge.unique] = {
            "name": "",
            "team": "",
            "role":"player"
        };
        bridge.call('DataSourceSet', {
            "beforeSync": true,
            "updateIfExist": false,
            //"uuid": bridge.args["httpResponse"]["data"]["data"]["uuid"],
            "uuid": "bdc67a1c-ec5e-4709-b96c-5b94a96e8c19",
            "value": value,
            "parent": null,
            "type": "socket",
            "debugTransaction": true,
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
    bridge.log("SocketDataAdd!");
}