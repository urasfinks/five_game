if (bridge.args["method"] === "switch") {
    bridge.alert("Hello DeepLink key: " + bridge.args["key"]);
}

if (["SecretConnections", "BattleOfMinds"].includes(bridge.args["method"])) {
    checkAlreadyGame(bridge.args["socketUuid"]);
}