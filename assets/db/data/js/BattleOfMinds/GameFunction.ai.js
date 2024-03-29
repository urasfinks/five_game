bridge.global.BattleOfMinds = {

    calculateScore: function (socketData, newStateData, socketUuid) {
        // newStateData["scoreRed"] = red;
        // newStateData["scoreBlue"] = blue;
        // newStateData["allBlue"] = allBlue;
        // newStateData["allRed"] = allRed;
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
        alreadyPersonGroup = bridge.arrayUnique(alreadyPersonGroup);
        for (var i = 0; i < alreadyPersonGroup.length; i++) {
            result.push({
                "label": alreadyPersonGroup[i]
            });
        }
        return result;
    },

    getListPersonByGroup: function (socketData, socketUuid) {
        var result = [];
        var isOwn = isOwner(socketData);
        var listPerson = getListPerson(socketData);
        var userTeam = this.getUserTeam(listPerson, false);
        var availableGroup = socketData["availableGroup"] || [];
        for (var i = 0; i < userTeam.length; i++) {
            if (availableGroup.length > 0) {
                result.push({
                    "templateCustom": "groupName",
                    "label": userTeam[i].label === "" ? "Без группы" : userTeam[i].label
                });
            }
            this.userByGroup(listPerson, result, userTeam[i].label, isOwn, socketUuid, availableGroup);
        }
        return result;
    },

    userByGroup: function (listPerson, result, curTeam, isOwn, socketUuid, resultTeam) {
        for (var i = 0; i < listPerson.length; i++) {
            if (listPerson[i]["team"].trim() === curTeam) {
                var ami = listPerson[i]["id"] === bridge.unique ? "Я " : "";

                var onTap = isOwn ? {
                    "sysInvoke": "NavigatorPush",
                    "args": {
                        "socketUuid": socketUuid,
                        "personId": listPerson[i]["id"],
                        "personValue": listPerson[i],
                        "listOptions": resultTeam,
                        "type": "bottomSheet",
                        "heightDynamic": true,
                        "link": {
                            "template": "BattleOfMinds/GamePersonEdit.json",
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
                    "label": ami + name,
                    "templateCustom": "user",
                    "templateWidgetSrc": "IteratorButtonIcon",
                    "iconSrc": iconSrc,
                    "iconColor": "#999999",
                    "onTap": onTap
                });
            }
        }
    },

    checkGameCondition: function (socketData, state) {
        if (!isOwner(socketData)) {
            state["isReadyStartGame"] = "false";
            return;
        }
        var listPerson = getListPerson(socketData);

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

    }

};