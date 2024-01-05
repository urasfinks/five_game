if (bridge.args["switch"] === "constructor") {
    var state = [];
    // state.push({
    //     "templateCustom": "templateLabel",
    //     "label": "Выбрать игру"
    // });
    state.push({
        "templateCustom": "templateGameLine",
        "label1": "Тайные Связи",
        "label2": "Битва умов",
        "src1": "sc2.png",
        "src2": "bom5.png",
        "childKey1": "" ,
        "childKey2": "",
        "onTap1": {
            "jsInvoke": "HomePage.js",
            "args": {
                "includeAll": true,
                "switch": "createGame"
            }
        },
        "onTap2": {}
    });
    bridge.call("SetStateData", {
        "map": {
            "listGame": state
        }
    });
}