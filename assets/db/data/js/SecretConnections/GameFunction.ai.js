bridge.global.SecretConnections = {
    getGridWord: function (socketData) {
        var listCard = [];
        for (var key in socketData) {
            if (key.startsWith("card")) {
                socketData[key]["index"] = key.split("card")[1];
                listCard.push(socketData[key]);
            }
        }
        var canBePressed = isMyGame(socketData);
        var isCapt = isCaptain(socketData);

        if (listCard.length === 0) {
            bridge.getRouter("SecretConnections/GameWord.ai.js")._generateWord("word_main.json");
        }

        listCard.sort(function (a, b) {
            return a["index"] - b["index"];
        });
        var counter = 0;
        var column = {
            "flutterType": "Column",
            "children": []
        };
        var matrix = bridge.orientation === "portrait" ? {col: 4, row: 6} : {col: 6, row: 4};
        var colorCard = {
            "red": "red",
            "blue": "blue",
            "neutral": "#efd9b9",
            "die": "black"
        };
        var colorText = {
            "red": "white",
            "blue": "white",
            "neutral": "black",
            "die": "white"
        };
        var mapCount = {};
        var mapCountMy = {};
        for (var key in socketData) {
            if (key.startsWith("tapCard_")) {
                var curKey = "i" + key.split("tapCard_")[1].split("_")[0];
                var amI = key.split("tapCard_")[1].split("_")[1];
                if (mapCount[curKey] == undefined) {
                    mapCount[curKey] = 1;
                } else {
                    mapCount[curKey]++;
                }
                if (amI === bridge.unique) {
                    mapCountMy[curKey] = true;
                }
            }
        }
        for (var c = 0; c < matrix.row; c++) {
            var row = {
                "flutterType": "Row",
                "children": []
            };
            for (var i = 0; i < matrix.col; i++) {
                var curIndex = counter++;
                var cardData = listCard[curIndex];
                var onTap = (canBePressed && cardData["selected"] == null) ? {
                    "jsRouter": "SecretConnections/GameRun.ai.js",
                    "args": {
                        "method": "onCardTap",
                        "index": counter - 1
                    }
                } : null;
                var onLongPress = (canBePressed && cardData["selected"] == null) ? {
                    "sysInvoke": "Alert",
                    "args": {
                        "confirmAction": true,
                        "label": "Подтвердите выбор слова, если это промах, ход автоматически перейдёт к другой команде",
                        "actionLabel": "Принять",
                        "backgroundColor": "schema:onBackground",
                        "actionBackgroundColor": "schema:projectPrimary",
                        "onPressed": {
                            "jsRouter": "SecretConnections/GameRun.ai.js",
                            "args": {
                                "indexCard": cardData["index"],
                                "method": "confirmSelect"
                            }
                        }
                    }
                } : null;
                if (cardData != undefined) {
                    var tapCount = mapCount["i" + curIndex] != undefined ? {
                        "flutterType": "Container",
                        "width": 20,
                        "height": 20,
                        "decoration": {
                            "flutterType": "BoxDecoration",
                            "color": mapCountMy["i" + curIndex] == undefined ? "rgba:0,0,0,0.75" : "rgba:50,205,50,0.75",
                            "borderRadius": 9,
                            "border": {
                                "flutterType": "Border",
                                "color": "white",
                                "width": 1.3
                            }
                        },
                        "child": {
                            "flutterType": "Center",
                            "child": {
                                "flutterType": "Text",
                                "label": "" + mapCount["i" + curIndex],
                                "style": {
                                    "flutterType": "TextStyle",
                                    "fontSize": 10,
                                    "color": "white"
                                }
                            }
                        }
                    } : {
                        "flutterType": "SizedBox"
                    };
                    if (cardData["selected"] != null) {
                        tapCount = {
                            "flutterType": "Container",
                            "width": 10,
                            "height": 10,
                            "decoration": {
                                "flutterType": "BoxDecoration",
                                "color": cardData["team"],
                                "borderRadius": 9
                            },
                            "child": {
                                "flutterType": "SizedBox"
                            }
                        };
                    }
                    //Если карточка выбрана - показываем её реальный цвет
                    var curColorCard = (isCapt || cardData["selected"] != null) ? colorCard[cardData["team"]] : "#efd9b9";
                    var curColorText = (isCapt || cardData["selected"] != null) ? colorText[cardData["team"]] : "black";
                    var decoration = "none";
                    var curWeightText = "bold";
                    if (cardData["selected"] != null) {
                        curWeightText = "normal";
                        curColorText = "schema:secondary";
                        curColorCard = "schema:onBackground";
                        if (cardData["selected"] !== cardData["team"]) {
                            decoration = "lineThrough";
                        }
                        if (cardData["team"] === "die") {
                            curColorText = "red";
                        }
                    }

                    var block = {
                        "flutterType": "Container",
                        "height": 50,
                        "margin": 5,
                        "child": {
                            "flutterType": "Material",
                            "color": curColorCard,
                            "borderRadius": 5,
                            "child": {
                                "flutterType": "InkWell",
                                "onTap": onTap,
                                "onLongPress": onLongPress,
                                "child": {
                                    "flutterType": "Stack",
                                    "alignment": "topEnd",
                                    "children": [
                                        {
                                            "flutterType": "Center",
                                            "child": {
                                                "flutterType": "Text",
                                                "textAlign": "center",
                                                "label": cardData["label"] != undefined ? cardData["label"].toUpperCase() : "???",
                                                "style": {
                                                    "flutterType": "TextStyle",
                                                    "decoration": decoration,
                                                    "fontSize": 12,
                                                    "fontWeight": curWeightText,
                                                    "color": curColorText
                                                }
                                            }
                                        },
                                        tapCount
                                    ]
                                }
                            }
                        }
                    };
                    row["children"].push({
                        "flutterType": "Expanded",
                        "child": block
                    });
                }
            }
            column["children"].push(row);
        }
        return column;
    },
    getUsers: function (socketData) {
        var reds = [], blues = [];
        for (var key in socketData) {
            if (key.startsWith("user") && socketData[key]["role"] === "captain") {
                if (socketData[key]["team"] === "red") {
                    reds.push(socketData[key]["name"] + " (Капитан)");
                } else if (socketData[key]["team"] === "blue") {
                    blues.push(socketData[key]["name"] + " (Капитан)");
                }
            }
        }
        for (var key in socketData) {
            if (key.startsWith("user") && socketData[key]["role"] !== "captain") {
                if (socketData[key]["team"] === "red") {
                    reds.push(socketData[key]["name"]);
                } else if (socketData[key]["team"] === "blue") {
                    blues.push(socketData[key]["name"]);
                }
            }
        }
        return {
            "red": reds.join(", "),
            "blue": blues.join(", "),
        }
    },

    calculateScore: function (socketData, newStateData, socketUuid) {
        var blue = 0, red = 0, allBlue = 0, allRed = 0;
        for (var key in socketData) {
            if (key.startsWith("card")) {
                if (socketData[key]["team"] === "red") {
                    allRed++;
                }
                if (socketData[key]["team"] === "blue") {
                    allBlue++;
                }
                if (socketData[key]["selected"] != undefined && socketData[key]["selected"] != null) {
                    if (socketData[key]["team"] === "blue") {
                        blue++;
                    }
                    if (socketData[key]["team"] === "red") {
                        red++;
                    }
                }
            }
        }
        if (socketData["finishDescription"] == undefined) {
            if (blue === allBlue && red === allRed) {
                socketSave({
                    finishDescription: "Ничья!",
                    gameState: "finish"
                }, socketUuid);
            } else if (blue === allBlue) {
                socketSave({
                    finishDescription: "Победила команда синих",
                    gameState: "finish"
                }, socketUuid);
            } else if (red === allRed) {
                socketSave({
                    finishDescription: "Победила команда красных",
                    gameState: "finish"
                }, socketUuid);
            }
        }
        newStateData["scoreRed"] = red;
        newStateData["scoreBlue"] = blue;
        newStateData["allBlue"] = allBlue;
        newStateData["allRed"] = allRed;
    },

    getListPersonGroup: function (socketData, team, socketUuid) {
        var result = [];
        var isOwn = isOwner(socketData);
        var listPerson = getListPerson(socketData);
        listPerson.sort(function (a, b) {
            return a["role"] === "captain" ? -1 : 1;
        });
        for (var i = 0; i < listPerson.length; i++) {
            var curTeam = ["red", "blue"].includes(listPerson[i]["team"]) ? listPerson[i]["team"] : "undefined";
            if (curTeam === team) {
                var ami = listPerson[i]["id"] === bridge.unique ? "Я " : "";
                var isCaptain = listPerson[i]["role"] === "captain" ? "Капитан " : "";
                var background = "schema:onBackground";
                var textColor = "schema:inversePrimary";
                if (team === "red") {
                    background = "red.600";
                    textColor = "white";
                }
                if (team === "blue") {
                    background = "blue.600";
                    textColor = "white";
                }
                var iconColor = (team === "red" || team === "blue") ? "#ffffff" : "#999999";

                var onTap = isOwn ? {
                    "sysInvoke": "NavigatorPush",
                    "args": {
                        "socketUuid": socketUuid,
                        "personId": listPerson[i]["id"],
                        "personValue": listPerson[i],
                        "type": "bottomSheet",
                        "heightDynamic": true,
                        "link": {
                            "template": "SecretConnections/GamePersonEdit.json",
                        }
                    }
                } : {};
                var iconPerson = "person_outline";
                var name = listPerson[i]["name"];
                if (listPerson[i]["static"] != undefined && listPerson[i]["static"] === true) {
                    name = "[" + name + "]";
                    iconPerson = "android";
                }
                var iconSrc = isOwn ? "edit" : iconPerson;
                result.push({
                    "label": ami + isCaptain + name,
                    "templateWidgetSrc": "IteratorButtonIcon",
                    "iconSrc": iconSrc,
                    "background": background,
                    "textColor": textColor,
                    "iconColor": iconColor,
                    "onTap": onTap
                });
            }
        }
        return result;
    },

    getFlagToWordGameState: function (socketData, state) {
        if (!isOwner(socketData)) {
            state["toWordGameState"] = "false";
            return;
        }
        //Надо что бы капитаны были реальные игроки
        //Надо что бы капитанов было 2

        var listPerson = getListPerson(socketData);
        var countCaptain = 0;
        var countRealCaptain = 0;

        for (var i = 0; i < listPerson.length; i++) {
            if (listPerson[i]["role"] === "captain") {
                countCaptain++;
                if (listPerson[i]["static"] !== true) {
                    countRealCaptain++;
                }
            }
        }
        if (countCaptain < 2) {
            state["error"] = "Надо выбрать капитанов для двух команд";
            state["toWordGameState"] = "false";
        } else if (countRealCaptain < 2) {
            state["error"] = "Капитан не может быть статичным участником";
            state["toWordGameState"] = "false";
        } else if (countCaptain > 2) {
            state["error"] = "Должно быть по одному капитану в каждой команде";
            state["toWordGameState"] = "false";
        }
        if (state["toWordGameState"] == undefined) {
            state["error"] = "";
            state["toWordGameState"] = "true";
        }
    },

    clearAllSelected: function (socketData, newSocketUpdate) {
        for (var key in socketData) {
            if (key.startsWith("tapCard_")) {
                newSocketUpdate[key] = null;
            }
        }
    },

    toggleTeam: function (socketData, newSocketUpdate) {
        newSocketUpdate["runTeam"] = socketData["runTeam"] === "blue" ? "red" : "blue";
    }
};