function isMyGame(socketData) {
    return (socketData["gameState"] === "run" && socketData["runTeam"] === getMyTeam(socketData));
}

function isOwner(socketData) {
    return socketData != undefined && socketData["owner"] === bridge.unique;
}

function isCaptain(socketData) {
    return socketData != undefined && socketData["user" + bridge.unique] != undefined && socketData["user" + bridge.unique]["role"] === "captain";
}

function getMyTeam(socketData) {
    return socketData["user" + bridge.unique] != undefined ? socketData["user" + bridge.unique]["team"] : "watcher";
}

function onRenderFloatingActionButton(socketData, socketUuid) {
    if (isOwner(socketData) && socketData["gameState"] === "team") {
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
                        "socketUuid": socketUuid,
                        "type": "bottomSheet",
                        "heightDynamic": true,
                        "link": {
                            "template": bridge.pageArgs["game"] + "/GamePersonAdd.json",
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

function socketSave(data, socketUuid) {
    if (socketUuid == undefined || socketUuid === "" || socketUuid.trim() === "") {
        bridge.alert("Сокетный идентификатор пуст");
    } else {
        bridge.call("DataSourceSet", {
            //"debugTransaction": true,
            "type": "socket",
            "uuid": socketUuid,
            "value": data
        });
    }
}

function getListPerson(socketData) {
    var listPerson = [];
    for (var key in socketData) {
        if (key.startsWith("user")) {
            socketData[key]["id"] = key.substring(4);
            listPerson.push(socketData[key]);
        }
    }
    return listPerson;
}

function getNavigatorPushGameArgs(gameUuid, socketUuid, game) {
    return {
        "uuid": game + "/Game.json",
        "gameUuid": gameUuid,
        "socketUuid": socketUuid,
        "socket": true,
        "game": game,
        "subscribeOnChangeUuid": [gameUuid],
        "constructor": {
            "jsRouter": game + "/GameInit.ai.js",
            "args": {
                "method": "constructor"
            }
        },
        "onChangeUuid": {
            "jsRouter": game + "/Game.ai.js",
            "args": {
                "method": "onChange"
            }
        },
        "onChangeOrientation": {
            "jsRouter": game + "/GameInit.ai.js",
            "args": {
                "method": "onChangeOrientation"
            }
        },
        "destructor": {
            "jsRouter": game + "/GameInit.ai.js",
            "args": {
                "method": "destructor"
            }
        },
        "onActive": {
            "jsRouter": game + "/GameInit.ai.js",
            "args": {
                "method": "onChangeOrientation"
            }
        },
        "onRenderFloatingActionButton": {
            "jsRouter": game + "/GameInit.ai.js",
            "args": {
                "method": "onRenderFloatingActionButton"
            }
        },
        "subscribeToRefresh": {
            "listUuid": [
                game + "/GameFunction.ai.js"
            ]
        }
    };
}

function constructGame(switchKeyOnResponseCode, switchKeyOnCheckUserSetUser) {
    bridge.call("Util", {"case": "wakeLock"});

    var cause = bridge.args["cause"];
    var socketUuid = bridge.pageArgs["socketUuid"];
    var gameUuid = bridge.pageArgs["gameUuid"];
    var game = bridge.pageArgs["game"];

    //Если gameUuid равен socketUuid - значит это владелец
    if (
        socketUuid != undefined
        && socketUuid === gameUuid
        && cause != undefined
        && (
            cause.includes("init")
            || cause.includes("TimePeriodic")
        )
    ) {
        //Только владелец перезапускает перегенирацию кода
        bridge.call("Util", {"case": "dynamicPageApi", "api": "startReloadEach", "eachReload": 300});
        bridge.call("DbQuery", {
            "sql": "select * from data where (uuid_data = ? or parent_uuid_data = ?) and is_remove_data = 0 order by id_data desc",
            "args": [socketUuid, socketUuid],
            "onFetch": {
                "jsRouter": game + "/GameInit.ai.js",
                "args": {
                    "method": switchKeyOnCheckUserSetUser
                }
            }
        });
        bridge.call("Http", {
            "uri": "/GenCodeUuid",
            "method": "POST",
            "body": {
                "uuid": socketUuid
            },
            "onResponse": {
                "jsRouter": game + "/GameInit.ai.js",
                "args": {
                    // Не стоит использовать текущий файл для обработки события ответа
                    // так как это функциональный файл, в нём должны находится статичные функции
                    // которые загружаются 1 раз в память
                    // если мы сюда приземлил обработчик, то кажый раз будеут переопределятся все функции
                    // Это будет замедлять работу приложения, и нам этого не надо
                    "method": switchKeyOnResponseCode
                }
            }
        });
    }
    controlBottomNavigationBar();
}

function destructorGame() {
    bridge.call("Show", {"case": "bottomNavigationBar"});
    bridge.call("Util", {"case": "wakeUnlock"});
}

function controlBottomNavigationBar() {
    if (bridge.pageActive) {
        if (bridge.orientation === "portrait") {
            bridge.call("Show", {"case": "bottomNavigationBar"});
        } else {
            bridge.call("Hide", {"case": "bottomNavigationBar"});
        }
    }
}

function groupFirstRealPerson(listPerson) {
    var listReal = [];
    var listStatic = [];
    for (var i = 0; i < listPerson.length; i++) {
        var isStatic = listPerson[i]["static"] || false;
        if (isStatic === true) {
            listStatic.push(listPerson[i]);
        } else {
            listReal.push(listPerson[i]);
        }
    }
    return listReal.concat(listStatic);
}

function translateGame(game) {
    switch (game) {
        case "SecretConnections":
        case "AlternativeWord":
            return "Тайные Связи";
        case "BattleOfMinds":
            return "Битва умов";
        default:
            return game;
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