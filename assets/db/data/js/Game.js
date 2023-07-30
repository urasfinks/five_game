if (bridge.args["switch"] == "destructor") {
    bridge.call('Show', {"case": "bottomNavigationBar"});
    bridge.log("Bottom SHOW 2!!!");
    bridge.call("WakeLock", {
        "lock": false
    });
}

if (bridge.args["switch"] == "constructor") {
    bridge.log("GAME constructor");
    controlBottomNavigationBar();
    bridge.call("WakeLock", {
        "lock": true
    });
}

if (bridge.args["switch"] == "onChange") {
    var lastState = bridge.state["originSocketData"] != undefined ? bridge.state["originSocketData"]["gameState"] : "";

    var socketData = bridge.args["data"];

    //bridge.log(socketData);
    var newStateData = {};

    //if (socketData["user" + bridge.unique] == undefined || socketData["user" + bridge.unique]["name"] == "") {
    newStateData["SwitchKey"] = socketData["gameState"];
    //}
    if (socketData["user" + bridge.unique] != undefined) {
        newStateData["deviceName"] = socketData["user" + bridge.unique]["name"];
    }

    bridge.state["originSocketData"] = newStateData["originSocketData"] = socketData;
    newStateData["listPersonUndefined"] = getListPerson(socketData, "undefined");
    newStateData["listPersonRed"] = getListPerson(socketData, "red");
    newStateData["listPersonBlue"] = getListPerson(socketData, "blue");

    if (socketData["gameState"] == "team") {
        newStateData["toWordGameState"] = getFlagToWordGameState(socketData);
    }

    newStateData["toNextTeam"] = (isCaptain(socketData) && isMyGame(socketData)) ? "true" : "false";

    if (["word", "run"].includes(socketData["gameState"])) {
        if (isOwner(socketData)) {
            newStateData["visibleGenerateWord"] = "true";
        }
        newStateData["gridWord"] = getGridWord(socketData);
    }

    if (["run", "finish"].includes(socketData["gameState"])) {
        calculateScore(socketData, newStateData);
        newStateData["users"] = getUsers(socketData);
    }

    bridge.call('SetStateData', {
        "map": newStateData
    });

    if (lastState != socketData["gameState"]) {
        onRenderFloatingActionButton();
    }
}

function getUsers(socketData) {
    var reds = [], blues = [];
    for (var key in socketData) {
        if (key.startsWith("user") && socketData[key]["role"] == "captain") {
            if (socketData[key]["team"] == "red") {
                reds.push(socketData[key]["name"] + " (Капитан)");
            } else if (socketData[key]["team"] == "blue") {
                blues.push(socketData[key]["name"] + " (Капитан)");
            }
        }
    }
    for (var key in socketData) {
        if (key.startsWith("user") && socketData[key]["role"] != "captain") {
            if (socketData[key]["team"] == "red") {
                reds.push(socketData[key]["name"]);
            } else if (socketData[key]["team"] == "blue") {
                blues.push(socketData[key]["name"]);
            }
        }
    }
    return {
        "red": reds.join(", "),
        "blue": blues.join(", "),
    }
}

function calculateScore(socketData, newStateData) {
    var blue = 0, red = 0, all = 0;
    for (var key in socketData) {
        if (key.startsWith("card")) {
            if (["red", "blue"].includes(socketData[key]["team"])) {
                all++;
            }
            if (socketData[key]["selected"] != undefined) {
                if (socketData[key]["team"] == "blue") {
                    blue++;
                } else if (socketData[key]["team"] == "red") {
                    red++;
                }
            }
        }
    }
    if (socketData["description"] == undefined) {
        if (blue + red == all) {
            socketSave({
                description: "Победила команда " + (blue > red ? "синих" : "красных"),
                gameState: "finish"
            })
        }
    }
    newStateData["scoreRed"] = red;
    newStateData["scoreBlue"] = blue;
    newStateData["scoreAll"] = all;
}

if (bridge.args["switch"] == "addPerson") {
    if (bridge.state["Name"] != undefined && bridge.state["Name"].trim() != "") {
        var data = {};
        userBlock = {
            name: bridge.state["Name"]
        };
        data["user" + bridge.call('Uuid', {})["uuid"]] = userBlock;
        socketSave(data);
        bridge.call("NavigatorPop", {});
    } else {
        bridge.alert("Имя слишком пустое)");
    }
}

if (bridge.args["switch"] == "setName") {
    //bridge.log();
    var data = {};
    var userBlock = {};
    var socketData = bridge.state["originSocketData"];
    if (socketData["user" + bridge.unique] != undefined) {
        userBlock = socketData["user" + bridge.unique];
    }
    userBlock["name"] = bridge.state["Name"];
    data["user" + bridge.unique] = userBlock;
    socketSave(data);
}

function socketSave(data) {
    var socketUuid = bridge.pageArgs["socketUuid"];
    bridge.call('DataSourceSet', {
        "debugTransaction": true,
        "type": "socket",
        "uuid": socketUuid,
        "value": data
    });
}

function socketExtend(action) {
    var socketUuid = bridge.pageArgs["socketUuid"];
    bridge.call('Http', {
        "uri": "/SocketExtend",
        "method": "POST",
        "body": {
            "uuid_data": socketUuid,
            "actions": [
                action
            ]
        }
    });
}

function isOwner(socketData) {
    return socketData != undefined && socketData["owner"] == bridge.unique;
}

function isCaptain(socketData) {
    return socketData != undefined && socketData["user" + bridge.unique] != undefined && socketData["user" + bridge.unique]["role"] == "captain";
}

function getMyTeam(socketData) {
    return socketData["user" + bridge.unique]["team"];
}

function getPersonList(socketData) {
    var listPerson = [];
    for (var key in socketData) {
        if (key.startsWith("user")) {
            socketData[key]["id"] = key;
            listPerson.push(socketData[key]);
        }
    }

    return listPerson;
}

function getListPerson(socketData, team) {
    var result = [];
    var isOwn = isOwner(socketData);
    var listPerson = getPersonList(socketData);
    listPerson.sort(function (a, b) {
        return a["role"] == "captain" ? -1 : 1;
    });
    for (var i = 0; i < listPerson.length; i++) {
        if (listPerson[i]["team"] == team
            || (listPerson[i]["team"] == undefined && team == "undefined")
        ) {
            var ami = listPerson[i]["id"] == ("user" + bridge.unique) ? "(Я) " : "";
            var isCaptain = listPerson[i]["role"] == "captain" ? "(Капитан) " : "";
            var background = "schema:onBackground";
            if (team == "red") {
                background = "red.600";
            }
            if (team == "blue") {
                background = "blue.600";
            }
            var iconColor = (team == "red" || team == "blue") ? "#ffffff" : "#999999";

            var onTap = isOwn ? {
                "sysInvoke": "NavigatorPush",
                "args": {
                    "socketUuid": bridge.pageArgs["socketUuid"],
                    "personKey": listPerson[i]["id"],
                    "personValue": listPerson[i],
                    "type": "BottomSheet",
                    "link": {
                        "template": "GamePersonEdit.json",
                    }
                }
            } : {};

            result.push({
                "label": ami + isCaptain + listPerson[i]["name"],
                "templateWidgetSrc": "ButtonIcon",
                "iconSrc": isOwn ? "edit" : "person_outline",
                "background": background,
                "iconColor": iconColor,
                "onTap": onTap
            });
        }
    }
    return result;
}

if (bridge.args["switch"] == "onRenderFloatingActionButton") {
    onRenderFloatingActionButton();
}

function onRenderFloatingActionButton() {
    if (isOwner(bridge.state["originSocketData"]) && bridge.state["originSocketData"]["gameState"] == "team") {
        bridge.call("Show", {
            "case": "actionButton",
            "template": {
                "flutterType": "FloatingActionButton",
                "child": {
                    "flutterType": "Icon",
                    "src": "add"
                },
                "onPressed": {
                    "sysInvoke": "NavigatorPush",
                    "args": {
                        "socketUuid": bridge.pageArgs["socketUuid"],
                        "type": "BottomSheet",
                        "link": {
                            "template": "GamePersonAdd.json",
                        }
                    }
                }
            }
        });
    } else {
        bridge.call("Hide", {
            "case": "actionButton"
        });
    }
}

if (bridge.args["switch"] == "savePerson") {
    if (bridge.state["Name"] != undefined && bridge.state["Name"].trim() != "") {
        var data = {};
        bridge.overlay(bridge.pageArgs["personValue"], {
            "name": bridge.state["Name"],
            "role": bridge.state["Role"],
            "team": bridge.state["Team"],
        });
        data[bridge.pageArgs["personKey"]] = bridge.pageArgs["personValue"];
        socketSave(data);
        bridge.call("NavigatorPop", {});
    } else {
        bridge.alert("Имя слишком пустое)");
    }
}

if (bridge.args["switch"] == "onCardTap") {
    bridge.log(bridge.args["index"]);
    var data = {};
    var key = "tapCard_" + bridge.args["index"] + "_" + bridge.unique;
    data[key] = bridge.state["originSocketData"][key] == undefined ? true : null;
    socketSave(data);
}

if (bridge.args["switch"] == "removePerson") {
    var data = {};
    data[bridge.pageArgs["personKey"]] = null;
    socketSave(data);
    bridge.call("NavigatorPop", {});
}

if (bridge.args["switch"] == "randomize") {
    var socketData = bridge.state["originSocketData"];
    var listPerson = getPersonList(socketData);
    listPerson = shuffle(listPerson);
    var data = {};
    for (var i = 0; i < listPerson.length; i++) {
        listPerson[i]["role"] = i < 2 ? "captain" : "player";
        listPerson[i]["team"] = i % 2 == 0 ? "red" : "blue";
        data[listPerson[i]["id"]] = listPerson[i];
        delete listPerson[i]["id"];
    }
    socketSave(data);
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

if (bridge.args["switch"] == "onChangeOrientation") {
    var socketData = bridge.state["originSocketData"];
    if (socketData != undefined && ["word", "run"].includes(socketData["gameState"])) {
        bridge.call('SetStateData', {
            "map": {
                "gridWord": getGridWord(socketData)
            }
        });
        controlBottomNavigationBar();
    }
    /*bridge.socketInsert("test", "timestamp", {
        "field": "finish"
    })*/
}

function controlBottomNavigationBar() {
    if (bridge.pageActive) {
        if (bridge.orientation == "portrait") {
            bridge.call('Show', {"case": "bottomNavigationBar"});
        } else {
            bridge.call('Hide', {"case": "bottomNavigationBar"});
        }
    }
}

function isMyGame(socketData) {
    return (socketData["gameState"] == "run" && socketData["runTeam"] == getMyTeam(socketData));
}

function getGridWord(socketData) {
    //bridge.orientation
    var listCard = [];
    for (var key in socketData) {
        if (key.startsWith("card")) {
            socketData[key]["index"] = key.split("card")[1];
            listCard.push(socketData[key]);
        }
    }
    var canBePressed = isMyGame(socketData);
    var isCapt = isCaptain(socketData);

    listCard.sort(function (a, b) {
        return a["index"] - b["index"];
    });
    var counter = 0;
    var column = {
        "flutterType": "Column",
        "children": []
    };
    var matrix = bridge.orientation == "portrait" ? {col: 4, row: 7} : {col: 7, row: 4};
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
            if (amI == bridge.unique) {
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
                "jsInvoke": "Game.js",
                "args": {
                    "includeStateData": true,
                    "includePageArgument": true,
                    "switch": "onCardTap",
                    "index": counter - 1
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
                            "color": cardData["selected"],
                            "borderRadius": 9
                        },
                        "child": {
                            "flutterType": "SizedBox"
                        }
                    };
                }
                //Если карточка выбрана - показываем её реальный цвет
                var curColorCard = (isCapt || cardData["selected"] != null) ? colorCard[cardData["team"]] : "#efd9b9";
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
                            "child": {
                                "flutterType": "Stack",
                                "alignment": "topEnd",
                                "children": [
                                    {
                                        "flutterType": "Center",
                                        "child": {
                                            "flutterType": "Text",
                                            "textAlign": "center",
                                            "label": cardData["selected"] == null ? cardData["label"].toUpperCase() : "",
                                            "style": {
                                                "flutterType": "TextStyle",
                                                "fontSize": 12,
                                                "fontWeight": "bold",
                                                "color": isCapt ? colorText[cardData["team"]] : "#efd9b9"
                                            }
                                        }
                                    },
                                    tapCount
                                ]
                            }
                        }
                    }
                };
                /*if (cardData["selected"] != null) {
                    block = {
                        "flutterType": "Opacity",
                        "opacity": 0.5,
                        "child": block
                    }
                }*/
                row["children"].push({
                    "flutterType": "Expanded",
                    "child": block
                });
            }
        }
        column["children"].push(row);
    }

    return column;
}

if (bridge.args["switch"] == "changeGameState") { //team/word/run/finish
    bridge.log("changeGameState");
    var data = {
        "gameState": bridge.args["gameState"]
    };
    socketSave(data);
    if (data["gameState"] == "run") {
        socketExtend({
            "action": "timestamp",
            "arguments": {
                "field": "startTimestamp"
            }
        });
    }
}

function getFlagToWordGameState(socketData) {
    if (!isOwner(socketData)) {
        return "false";
    }

    var listPerson = getPersonList(socketData);
    var countCaptain = 0;
    var countRed = 0;
    var countBlue = 0;
    var countUndefined = 0;

    for (var i = 0; i < listPerson.length; i++) {
        if (listPerson[i]["role"] == "captain") {
            countCaptain++;
            if (listPerson[i]["team"] == "red") {
                countRed++;
            }
            if (listPerson[i]["team"] == "blue") {
                countBlue++;
            }
        }

        if (listPerson[i]["team"] == undefined || listPerson[i]["team"] == "undefined") {
            countUndefined++;
        }
    }

    if (countCaptain != 2) {
        if (listPerson.length > 1) {
            bridge.alert("Надо выбрать капитанов для двух команд");
        }
        return "false";
    }
    if (countUndefined > 0) {
        bridge.alert("Надо распределить " + countUndefined + " человек по командам");
        return "false";
    }
    if (countRed > 1 || countBlue > 1) {
        bridge.alert("У команды должен быть 1 капитан");
        return "false";
    }
    return "true";
}

if (bridge.args["switch"] == "toNextTeam") {
    var socketData = bridge.state["originSocketData"];
    var newSocketUpdate = {};
    for (var key in socketData) {
        if (key.startsWith("tapCard_")) {
            //tapCard_3_0b12f03e-7b9d-4175-a6fc-a0a368917005
            var curIndexCard = key.split("tapCard_")[1].split("_")[0];
            newSocketUpdate[key] = null;
            var card = newSocketUpdate["card" + curIndexCard] || socketData["card" + curIndexCard];
            if (card["userPress"] == undefined) {
                card["userPress"] = [];
            }
            if (card["team"] == "black") {
                newSocketUpdate["gameState"] = "finish";
                newSocketUpdate["description"] = "Выбрана чёрная карта." +
                    ". Выиграла " + (socketData["runTeam"] == "blue" ? "красная" : "синяя") +
                    " команда";
            }
            card["userPress"].push(key.split("_").pop());
            card["selected"] = socketData["runTeam"];
            newSocketUpdate["card" + curIndexCard] = card;
        }
    }
    newSocketUpdate["runTeam"] = socketData["runTeam"] == "blue" ? "red" : "blue";
    bridge.log(newSocketUpdate);
    socketSave(newSocketUpdate);
}