function GameAvailableRouter(){
    this.constructor = function(){
        var state = [];
        state.push({
            "templateCustom": "templateGameLine",
            "label1": "Тайные Связи",
            "label2": "Битва умов",
            "src1": "sc2.png",
            "src2": "bom5.png",
            "childKey1": "" ,
            "childKey2": "",
            "onTap1": {
                "jsRouter": "HomePage.ai.js",
                "args": {
                    "game": "SecretConnections",
                    "includeAll": true,
                    "method": "createGame"
                }
            },
            "onTap2": {
                "jsRouter": "HomePage.ai.js",
                "args": {
                    "game": "BattleOfMinds",
                    "includeAll": true,
                    "method": "createGame"
                }
            }
        });
        bridge.call("SetStateData", {
            "map": {
                "listGame": state
            }
        });
    }
}
bridge.addRouter(new GameAvailableRouter());