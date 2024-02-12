function RandomizeUserRouter(){
    this.constructor = function(){
        var socketUuid = bridge.pageArgs["socketUuid"];
        bridge.call("DbQuery", {
            "sql": "select * from data where (uuid_data = ? or parent_uuid_data = ?) and is_remove_data = 0 order by id_data desc",
            "args": [socketUuid, socketUuid],
            "onFetch": {
                "jsRouter": "BattleOfMinds/RandomizeUser.ai.js",
                "args": {
                    "method": route(this, this.onSelectSocketData)
                }
            }
        });
    };

    this.onSelectSocketData = function(){
        if (bridge.args["fetchDb"].length > 0) {
            var socketData = bridge.args["fetchDb"][0]["value_data"];
            var listPerson = getListPerson(socketData);
            var userTeam = bridge.global.BattleOfMinds.getUserTeam(listPerson);
            bridge.log(userTeam);
            /*bridge.call("SetStateData", {
                "map": {
                    "userTeam": userTeam
                }
            });*/
        }
    };

}

bridge.addRouter(new RandomizeUserRouter());