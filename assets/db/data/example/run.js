var x = {
    arrayUnique: function (ar) {
        return ar.filter(function (value, index, array) {
            return array.indexOf(value) === index;
        });
    },
    getUserTeam: function (listPerson, useUserNameIfTeamEmpty) {
        var alreadyPersonGroup = [];
        var result = [];
        for (var i = 0; i < listPerson.length; i++) {
            var team = listPerson[i]["team"].trim();
            if (useUserNameIfTeamEmpty === true && team === "") {
                team = listPerson[i]["name"].trim();
            }
            alreadyPersonGroup.push(team);
        }
        alreadyPersonGroup = this.arrayUnique(alreadyPersonGroup);
        for (var i = 0; i < alreadyPersonGroup.length; i++) {
            result.push({
                label: alreadyPersonGroup[i],
            });
        }
        return result;
    },
    getListPerson: function (socketData) {
        var listPerson = [];
        for (var key in socketData) {
            if (key.startsWith("user")) {
                socketData[key]["id"] = key.substring(4);
                listPerson.push(socketData[key]);
            }
        }
        return listPerson;
    },
    checkGameCondition: function (socketData, state) {
        var listPerson = this.getListPerson(socketData);
        var isStatus = true;
        if (listPerson.length < 2) {
            state["error"] = "Участников должно быть больше одного";
            state["isReadyStartGame"] = "false";
            isStatus = false;
        }
        if (isStatus === true) {
            var availableGroup = socketData["availableGroup"] || [];
            var avGroup = [""];
            for (var i = 0; i < availableGroup.length; i++) {
                avGroup.push(availableGroup[i].label);
            }
            for (var j = 0; j < listPerson.length; j++) {
                if (!avGroup.includes(listPerson[j]["team"].trim())) {
                    state["error"] = "Участник " + listPerson[j]["name"] + " состоит в несуществующей группе " + listPerson[j]["team"].trim();
                    state["isReadyStartGame"] = "false";
                    isStatus = false;
                    break;
                }
            }

        }
        if (isStatus === true) {
            var userTeam = this.getUserTeam(listPerson, true);
            for (var i = 0; i < userTeam.length; i++) {
                userTeam[i]["findRealPerson"] = false;
                userTeam[i]["listUser"] = [];
                for (var j = 0; j < listPerson.length; j++) {
                    var team = listPerson[j]["team"].trim();
                    if (team === "") {
                        team = listPerson[j]["name"].trim();
                    }
                    if (team === userTeam[i].label) {
                        userTeam[i]["listUser"].push(listPerson[j]);
                        if (listPerson[j].static === false) {
                            userTeam[i]["findRealPerson"] = true;
                            break;
                        }
                    }
                }
            }
            for (var i = 0; i < userTeam.length; i++) {
                if (userTeam[i]["findRealPerson"] === false) {
                    if (userTeam[i]["listUser"].length === 1 && userTeam[i].label.trim() === userTeam[i]["listUser"][0]["name"].trim()) {
                        state["error"] = userTeam[i]["listUser"][0]["name"] + " должен быть в составе группы";
                        state["isReadyStartGame"] = "false";
                    } else {
                        state["error"] = "В группе " + userTeam[i].label + " нет реального участника";
                        state["isReadyStartGame"] = "false";
                    }
                    isStatus = false;
                    break;
                }
            }
        }

        if (isStatus === true) {
            state["error"] = "";
            state["isReadyStartGame"] = "true";
        }
    },
};
var state = {};
x.checkGameCondition(
    {
        "game": "BattleOfMinds",
        "gameUuid": "61a3639e-5ec4-47a9-ae9b-e5df7d77abb8",
        "owner": "9f5601ee-5a2e-4470-abc5-3527537bb218",
        "runTeam": "red",
        "gameState": "team",
        "user9f5601ee-5a2e-4470-abc5-3527537bb218": {
            "name": "Supports",
            "id": "9f5601ee-5a2e-4470-abc5-3527537bb218",
            "static": false,
            "team": "Итии",
            "role": "player"
        },
        "gameCode": 865834,
        "timestampCodeGenerate": 1708278962,
        "user71066b00-a6af-4974-b98d-bdabf1ebae66": {
            "name": "Василий",
            "id": "71066b00-a6af-4974-b98d-bdabf1ebae66",
            "static": true,
            "team": "Новый 1",
            "role": "player"
        },
        "userc00b1a51-9d4a-4064-b60d-829b659b81ef": {
            "name": "Ха",
            "id": "c00b1a51-9d4a-4064-b60d-829b659b81ef",
            "static": true,
            "team": "Итии",
            "role": "player"
        },
        "user9dac2fe3-c800-40e9-b37b-f2db3c095e0a": {
            "name": "Ррот",
            "id": "9dac2fe3-c800-40e9-b37b-f2db3c095e0a",
            "static": true,
            "team": "Итии",
            "role": "player"
        },
        "availableGroup": [{
            "label": "Новый 1"
        }, {
            "label": "Итии"
        }],
        "themeGameLabel": "Гарри Поттер"
    },
    state
);
console.log(state);
