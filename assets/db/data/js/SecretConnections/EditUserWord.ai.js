function SecretConnectionsEditUserWordRouter() {
    this.constructor = function () {
        // bridge.call("SetStateData", {
        //     "map": {
        //         "listItem": [
        //             {
        //                 "label": "Opa"
        //             },
        //             {
        //                 "label": "Na"
        //             }
        //         ]
        //     }
        // });
    };

    this.add = function(){
        var listItem = bridge.state["main"]["listItem"] || [];
        listItem.unshift({
            "label": ""
        });
        bridge.call("SetStateData", {
            "map": {
                "listItem": listItem
            }
        });
    };

    this.remove = function(){
        var listItem = bridge.state["main"]["listItem"];
        bridge.log(listItem);
        bridge.arrayRemove(listItem, bridge.args["removeIndex"]*1);
        bridge.call("SetStateData", {
            "map": {
                "listItem": listItem
            }
        });
    };
}

bridge.addRouter(new SecretConnectionsEditUserWordRouter());