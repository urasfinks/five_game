function MyGameRouter() {

    this.constructor = function () {
        bridge.call("DbQuery", {
            "sql": "select * from data where key_data = ? and is_remove_data = 0 order by date_add_data desc",
            "args": ["Game"],
            "onFetch": {
                "jsRouter": "MyGame.ai.js",
                "args": {
                    "includeAll": true,
                    "method": "selectMyGame"
                }
            }
        });
    };

    this.onRemove = function () {
        bridge.call("DbQuery", {
            "sql": "update data set is_remove_data = 1 where id_data = ?",
            "args": [bridge.args["id_data"]],
            "onFetch": {
                "jsRouter": "MyGame.ai.js",
                "args": {
                    "includeAll": true,
                    "method": "onRemoved"
                }
            }
        });
    };

    this.onRemoved = function () {
        bridge.call("PageReload", {
            "case": "current"
        });
        bridge.call("PageReload", {
            "case": "subscribed",
            "key": "Game"
        });
    };

    this.selectMyGame = function () {
        var list = [];
        if (bridge.args["fetchDb"].length > 0) {
            var stateMap = {
                "team": "Набор команды",
                "word": "Выбор карточек",
                "run": "Игра начата",
                "finish": "Игра закончена",
            };
            for (var i = 0; i < bridge.args["fetchDb"].length; i++) {
                var fetch = bridge.args["fetchDb"][i];
                var date = new Date(fetch["date_add_data"] * 1000);
                var socketUuid = fetch["uuid_data"];
                if (fetch["parent_uuid_data"] != undefined && fetch["parent_uuid_data"].trim() !== "") {
                    socketUuid = fetch["parent_uuid_data"];
                }
                var gameUuid = fetch["uuid_data"];
                var game = bridge.args["fetchDb"][i]["value_data"]["game"] || "Игра без описания";
                var state = " \r\n" + stateMap[bridge.args["fetchDb"][i]["value_data"]["gameState"]];
                list.push({
                    "label": translateGame(game) + state,
                    "labelExtra": dateFormat(date),
                    "templateWidgetSrc": "IteratorButtonExtraIconWithRemove",
                    "id_data": bridge.args["fetchDb"][i]["id_data"],
                    "onTap": {
                        "sysInvoke": "NavigatorPush",
                        "args": getNavigatorPushGameArgs(gameUuid, socketUuid, game)
                    }
                });
            }
            bridge.call("SetStateData", {
                "map": {
                    "listGame": list
                }
            });
        }
    };
}

bridge.addRouter(new MyGameRouter());