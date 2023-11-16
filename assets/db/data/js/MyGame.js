if (bridge.args["switch"] === "constructor") {
    bridge.call("DbQuery", {
        "sql": "select * from data where key_data = ? and is_remove_data = 0 order by date_add_data desc",
        "args": ["Game"],
        "onFetch": {
            "jsInvoke": "MyGame.js",
            "args": {
                "includeAll": true,
                "switch": "selectMyGame"
            }
        }
    });
}

if (bridge.args["switch"] === "onRemove") {
    bridge.call("DbQuery", {
        "sql": "update data set is_remove_data = 1 where id_data = ?",
        "args": [bridge.args["id_data"]],
        "onFetch": {
            "jsInvoke": "MyGame.js",
            "args": {
                "includeAll": true,
                "switch": "onRemoved"
            }
        }
    });
}

if (bridge.args["switch"] === "onRemoved") {
    bridge.call("PageReload", {
        "case": "current"
    });
    bridge.call("PageReload", {
        "case": "subscribed",
        "key": "Game"
    });
}

if (bridge.args["switch"] === "selectMyGame") {
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
            var date = new Date(fetch["date_add_data"] * 1);
            var socketUuid = fetch["uuid_data"];
            if (fetch["parent_uuid_data"] != undefined && fetch["parent_uuid_data"].trim() !== "") {
                socketUuid = fetch["parent_uuid_data"];
            }
            var gameUuid = fetch["uuid_data"];
            var state = " \r\n" + stateMap[bridge.args["fetchDb"][i]["value_data"]["gameState"]];
            list.push({
                "label": (bridge.args["fetchDb"][i]["value_data"]["description"] || "Игра без описания") + state,
                "labelExtra": dateFormat(date),
                "templateWidgetSrc": "IteratorButtonExtraIconWithRemove",
                "id_data": bridge.args["fetchDb"][i]["id_data"],
                "onTap": {
                    "sysInvoke": "NavigatorPush",
                    "args": getNavigatorPushGameArgs(gameUuid, socketUuid)
                }
            });
        }
        bridge.call("SetStateData", {
            "map": {
                "listGame": list
            }
        });
    }
}

function dateFormat(d) {
    return ("0" + d.getDate()).slice(-2) +
        "." + ("0" + (d.getMonth() + 1)).slice(-2) +
        "." + d.getFullYear() +
        " " +
        ("0" + d.getHours()).slice(-2) +
        ":" + ("0" + d.getMinutes()).slice(-2);
}