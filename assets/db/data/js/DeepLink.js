if (bridge.args["switch"] === "switch") {
    bridge.alert("Hello DeepLink key: " + bridge.args["key"]);
}

if (["SecretConnections", "BattleOfMinds"].includes(bridge.args["switch"])) {
    checkAlreadyGame(bridge.args["socketUuid"]);
}