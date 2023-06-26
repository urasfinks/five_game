if (bridge.args["switch"] == "constructor") {
    let isAuth = bridge.call('GetStorage', {
        "key": "isAuth",
        "default": "false"
    })["isAuth"];

    bridge.log("Hello constructor: " + isAuth);

    bridge.call('SetStateData', {
        "key": "SwitchKey",
        "value": isAuth == "true" ? "auth" : "default"
    });

    bridge.call('DbQuery', {
        "sql": "select count(*) as count from data UNION ALL select count(*) as count from data where type_data = ? UNION ALL select count(*) as count from data where type_data = ? and revision_data = 0",
        "args": ["userDataRSync", "userDataRSync"],
        "onFetch": {
            "jsInvoke": "Account.js",
            "args": {
                "switch": "onFetchCountAllData"
            }
        }
    });
}

if (bridge.args["switch"] == "onFetchCountAllData") {
    bridge.call('SetStateData', {
        "map": {
            "countAllData": bridge.args["fetchDb"][0]["count"],
            "countPersonData": bridge.args["fetchDb"][1]["count"],
            "countSyncData": bridge.args["fetchDb"][1]["count"]
        }
    });
}

if (bridge.args["switch"] == "GetCode") {
    bridge.call("HideKeyboard", {});
    bridge.call("CustomLoaderOpen", {});
    bridge.call('Http', {
        "uri": "/GetCode",
        "body": {
            "mail": bridge.state["EmailValue"]
        },
        "onResponse": {
            "jsInvoke": "Account.js",
            "args": {
                "includeStateData": true,
                "switch": "GetCodeResponse"
            }
        }
    });
}

if (bridge.args["switch"] == "GetCodeResponse") {
    bridge.call("CustomLoaderClose", {});
    bridge.log(bridge.args);
    if (bridge.args["body"]["status"] == false) {
        bridge.call("Alert", {
            "duration": 7000,
            "label": bridge.args["body"]["exception"].join(", ")
        });
    } else {
        bridge.call("NavigatorPush", {
            "name": "Humidor",
            "type": "BottomSheet",
            "mail": bridge.state["EmailValue"],
            "link": {
                "template": "AccountCode.json",
            }
        });
    }
}

if (bridge.args["switch"] == "ConfirmCode") {
    //bridge.log(bridge.state);
    bridge.call('Http', {
        "uri": "/SignIn",
        "body": {
            "code": bridge.state["CodeValue"] * 1,
            "mail": bridge.pageArgs["mail"]
        },
        "onResponse": {
            "jsInvoke": "Account.js",
            "args": {
                "includePageArgument": true,
                "switch": "ConfirmCodeResponse"
            }
        }
    });
}

if (bridge.args["switch"] == "ConfirmCodeResponse") {
    bridge.log(bridge.args);
    if (bridge.args["body"]["status"] == false) {
        bridge.call("Alert", {
            "duration": 7000,
            "label": bridge.args["body"]["exception"].join(", ")
        });
    } else {
        bridge.call('SetStorage', {
            "key": "isAuth",
            "value": "true"
        });
        bridge.call('SetStorage', {
            "key": "mail",
            "value": bridge.pageArgs["mail"]
        });
        bridge.call("NavigatorPop", {
            "reloadParent": true
        });
    }
}