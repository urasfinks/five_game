bridge.log("HomePageFunction.js included");
function getNavigatorPushGameArgs(gameUuid, socketUuid) {
    return {
        "uuid": "Game.json",
        "gameUuid": gameUuid,
        "socketUuid": socketUuid,
        "socket": true,
        "subscribeOnChangeUuid": [gameUuid],
        "constructor": {
            "jsInvoke": "GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "constructor"
            }
        },
        "onChangeUuid": {
            "jsInvoke": "Game.js",
            "args": {
                "includeAll": true,
                "switch": "onChange"
            }
        },
        "onChangeOrientation": {
            "jsInvoke": "GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "onChangeOrientation"
            }
        },
        "destructor": {
            "jsInvoke": "GameInit.js",
            "args": {
                "switch": "destructor"
            }
        },
        "onActive": {
            "jsInvoke": "GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "onChangeOrientation"
            }
        },
        "onRenderFloatingActionButton": {
            "jsInvoke": "GameInit.js",
            "args": {
                "includeAll": true,
                "switch": "onRenderFloatingActionButton"
            }
        }
    };
}