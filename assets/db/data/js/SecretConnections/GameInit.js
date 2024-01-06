if (bridge.args["switch"] === "destructor") {
    bridge.call("Show", {"case": "bottomNavigationBar"});
    bridge.call("Util", {"case": "wakeUnlock"});
}

if (bridge.args["switch"] === "constructor") {
    controlBottomNavigationBar();
    bridge.call("Util", {"case": "wakeLock"});
}

if (bridge.args["switch"] === "onChangeOrientation") {
    var socketData = bridge.state["main"]["originSocketData"];
    if (socketData != undefined && ["word", "run"].includes(socketData["gameState"])) {
        bridge.call("SetStateData", {
            "map": {
                "gridWord": getGridWord(socketData)
            }
        });
        controlBottomNavigationBar();
    }
}

if (bridge.args["switch"] === "onRenderFloatingActionButton") {
    var socketData = bridge.state["main"]["originSocketData"];
    onRenderFloatingActionButton(socketData, bridge.pageArgs["socketUuid"]);
}

function controlBottomNavigationBar() {
    if (bridge.pageActive) {
        if (bridge.orientation === "portrait") {
            bridge.call("Show", {"case": "bottomNavigationBar"});
        } else {
            bridge.call("Hide", {"case": "bottomNavigationBar"});
        }
    }
}