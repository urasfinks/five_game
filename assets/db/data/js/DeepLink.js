if (bridge.args["switch"] === "switch") {
    bridge.alert("Hello DeepLink key: " + bridge.args["key"]);
}

if (bridge.args["switch"] === "ConnectAlternativeWord") {
    var socketUuid = bridge.args["socketUuid"];
    bridge.call("DbQuery", {
        "sql": "select * from data where uuid_data = ? or parent_uuid_data = ? order by id_data desc",
        "args": [socketUuid, socketUuid],
        "onFetch": {
            "jsInvoke": "HomePage.js",
            "args": {
                "socketUuid": socketUuid,
                "includeAll": true,
                "closeBottomSheet": false,
                "switch": "selectAllReadyGame"
            }
        }
    });
}