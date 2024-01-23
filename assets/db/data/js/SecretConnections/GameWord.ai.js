function SecretConnectionsGameWordRouter() {

    this.generateWord = function () {
        bridge.call("DbQuery", {
            "sql": "select * from data where uuid_data = ? and key_data = ? and is_remove_data = 0 order by meta_data asc",
            "args": [bridge.state["groupWord"]["groupWord"]["uuid"], "word"],
            "onFetch": {
                "jsRouter": "SecretConnections/GameWord.ai.js",
                "args": {
                    "method": route(this, this.onSelect)
                }
            }
        });
    };

    this.onSelect = function () {
        if (bridge.args["fetchDb"].length > 0) {
            var list = bridge.args["fetchDb"][0]["value_data"]["listWord"];
            bridge.shuffle(list);
            var list2 = [];
            var all = 24;
            var med = Math.floor((all - 1) / 3);
            var mark = {
                red: med + 1,
                blue: med,
                die: 1,
                neutral: all - 2 - (med * 2)
            };
            var counter = 0;
            for (var key in mark) {
                for (var i = 0; i < mark[key]; i++) {
                    list2.push({
                        "label": list[counter++],
                        "team": key, //red/blue/neutral/die
                        "selected": null //blue/red/null
                    });
                }
            }
            bridge.shuffle(list2);
            var data = {};
            for (var i = 0; i < all; i++) {
                data["card" + i] = list2[i];
            }
            data["isGeneratedCard"] = true;
            socketSave(data, bridge.pageArgs["socketUuid"]);
        }
    }
}

bridge.addRouter(new SecretConnectionsGameWordRouter());