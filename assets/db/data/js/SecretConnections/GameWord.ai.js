function SecretConnectionsGameWordRouter() {

    this.generateWord = function () {
        this._generateWord(bridge.state["groupWord"]["groupWord"]["uuid"]);
    };

    this._generateWord = function(uuid){
        bridge.call("DbQuery", {
            "sql": "select * from data where uuid_data = ? and key_data = ? and is_remove_data = 0 order by meta_data asc",
            "args": [uuid, "word"],
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
            var list = bridge.args["fetchDb"][0]["value_data"]["list"];
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
                    var curIndex = counter++;
                    list2.push({
                        "label": list[curIndex] != undefined ? list[curIndex]["label"] : "???",
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
    };

    this.onChangeGroupWord = function () {
        //{"method":"onChangeGroupWord","state":"groupWord","stateKey":"groupWord","selected":{"label":"Привет","uuid":"fe631169-a194-4eb5-a9f0-499c9710863e","isMy":true,"iteratorIndex":0}}; pageUuid: 4088a05c-c40f-4245-a51c-f0f9c375a246;
        this._generateWord(bridge.args["selected"]["uuid"]);
    }

    this.addNewGroupWord = function () {
        //{"method":"addNewGroupWord","state":"groupWord","stateKey":"groupWord","selected":{"isNew":true,"label":"Ну","uuid":"new.json"}}
        bridge.args["selected"]["uuid"] = bridge.util("uuid", {});
        bridge.call("DataSourceSet", {
            "uuid": bridge.args["selected"]["uuid"],
            "value": {
                "label": bridge.args["selected"]["label"],
                "list": []
            },
            "type": "userDataRSync",
            "key": "word",
            "updateIfExist": false, //Если уже есть, мы ничего не будем делать
            "onPersist": {
                "jsRouter": "SecretConnections/GameWord.ai.js",
                "args": {
                    "state": bridge.args["state"],
                    "stateKey": bridge.args["stateKey"],
                    "selected": bridge.args["selected"],
                    "method": route(this, this.onAddNewGroupWordPersist)
                }
            }
        });
    };

    this.onAddNewGroupWordPersist = function () {
        bridge.log(bridge.args);
        bridge.call("SetStateData", {
            "state": bridge.args["state"],
            "key": bridge.args["stateKey"],
            "value": bridge.args["selected"]
        });
    };

    this.onEdit = function () {
        bridge.call("NavigatorPush", {
            "flutterType": "Notify",
            "link": {
                "template": "ListItem.json"
            },
            "data": {
                "uuid": bridge.state["groupWord"]["groupWord"]["uuid"],
                "type": "userDataRSync",
                "bottomSheetHeight": 184
            },
            "context": {
                "key": "Tab0",
                "data": {
                    "template": {
                        "flutterType": "Scaffold",
                        "appBar": {
                            "flutterType": "AppBar",
                            "title": {
                                "flutterType": "Text",
                                "label": ""
                            }
                        }
                    }
                }
            }
        });
    }
}

bridge.addRouter(new SecretConnectionsGameWordRouter());