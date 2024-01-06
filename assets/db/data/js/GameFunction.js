bridge.log("GameFunction.js included");

function isMyGame(socketData) {
    return (socketData["gameState"] === "run" && socketData["runTeam"] === getMyTeam(socketData));
}

function isOwner(socketData) {
    return socketData != undefined && socketData["owner"] === bridge.unique;
}

function isCaptain(socketData) {
    return socketData != undefined && socketData["user" + bridge.unique] != undefined && socketData["user" + bridge.unique]["role"] === "captain";
}

function getMyTeam(socketData) {
    return socketData["user" + bridge.unique] != undefined ? socketData["user" + bridge.unique]["team"] : "watcher";
}

function onRenderFloatingActionButton(socketData, socketUuid) {
    if (isOwner(socketData) && socketData["gameState"] === "team") {
        bridge.call("Show", {
            "case": "actionButton",
            "template": {
                "flutterType": "FloatingActionButton",
                "child": {
                    "flutterType": "Icon",
                    "src": "add"
                },
                "onPressed": {
                    "sysInvoke": "NavigatorPush",
                    "args": {
                        "socketUuid": socketUuid,
                        "type": "bottomSheet",
                        "height": 200,
                        "link": {
                            "template": "SecretConnections/GamePersonAdd.json",
                        }
                    }
                }
            }
        });
    } else {
        bridge.call("Hide", {
            "case": "actionButton"
        });
    }
}

function socketSave(data, socketUuid) {
    bridge.call("DataSourceSet", {
        //"debugTransaction": true,
        "type": "socket",
        "uuid": socketUuid,
        "value": data
    });
}

function getListPerson(socketData) {
    var listPerson = [];
    for (var key in socketData) {
        if (key.startsWith("user")) {
            socketData[key]["id"] = key.substring(4);
            listPerson.push(socketData[key]);
        }
    }
    return listPerson;
}

function getNavigatorPushGameArgs(gameUuid, socketUuid, game) {
    return {
        "uuid": game + "/Game.json",
        "gameUuid": gameUuid,
        "socketUuid": socketUuid,
        "socket": true,
        "subscribeOnChangeUuid": [gameUuid],
        "constructor": {
            "jsInvoke": game + "/GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "constructor"
            }
        },
        "onChangeUuid": {
            "jsInvoke": game + "/Game.js",
            "args": {
                "includeAll": true,
                "switch": "onChange"
            }
        },
        "onChangeOrientation": {
            "jsInvoke": game + "/GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "onChangeOrientation"
            }
        },
        "destructor": {
            "jsInvoke": game + "/GameInit.js",
            "args": {
                "switch": "destructor"
            }
        },
        "onActive": {
            "jsInvoke": game + "/GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "onChangeOrientation"
            }
        },
        "onRenderFloatingActionButton": {
            "jsInvoke": game + "/GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "onRenderFloatingActionButton"
            }
        },
        "subscribeToRefresh": {
            "listUuid": [
                game + "/GameFunction.js"
            ]
        },
        "js": [
            game + "/GameFunction.js"
        ]
    };
}