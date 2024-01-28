bridge.global.BattleOfMinds = {

    undefinedGroup: "Не в группе",

    calculateScore: function (socketData, newStateData, socketUuid) {
        // newStateData["scoreRed"] = red;
        // newStateData["scoreBlue"] = blue;
        // newStateData["allBlue"] = allBlue;
        // newStateData["allRed"] = allRed;
    },

    getUserTeam: function(listPerson){
        var alreadyPersonGroup = [];
        var result = [];
        for (var i = 0; i < listPerson.length; i++) {
            if (listPerson[i]["team"].trim() !== "") {
                alreadyPersonGroup.push(listPerson[i]["team"]);
            } else {
                alreadyPersonGroup.push(this.undefinedGroup);
            }
        }
        alreadyPersonGroup = bridge.arrayUnique(alreadyPersonGroup);
        for (var i = 0; i < alreadyPersonGroup.length; i++) {
            result.push({
                "label": alreadyPersonGroup[i]
            });
        }
        return result;
    },

    getListPersonGroup: function (socketData, socketUuid) {
        var result = [];
        var isOwn = isOwner(socketData);
        var listPerson = getListPerson(socketData);
        var userTeam = this.getUserTeam(listPerson);

        for (var i = 0; i < userTeam.length; i++) {
            if (userTeam.length > 1) {
                result.push({
                    "templateCustom": "groupName",
                    "label": userTeam[i].label
                });
            }
            this.userByGroup(listPerson, result, userTeam[i].label, isOwn, socketUuid, userTeam);
        }
        return result;
    },

    userByGroup: function (listPerson, result, curTeam, isOwn, socketUuid, resultTeam) {
        for (var i = 0; i < listPerson.length; i++) {
            if (
                listPerson[i]["team"] === curTeam
                || (listPerson[i]["team"].trim() === "" && this.undefinedGroup === curTeam)
            ) {
                var ami = listPerson[i]["id"] === bridge.unique ? "Я " : "";

                var onTap = isOwn ? {
                    "sysInvoke": "NavigatorPush",
                    "args": {
                        "socketUuid": socketUuid,
                        "personId": listPerson[i]["id"],
                        "personValue": listPerson[i],
                        "listOptions": resultTeam,
                        "type": "bottomSheet",
                        "height": 360,
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

    getFlagToWordGameState: function (socketData, state) {
        if (!isOwner(socketData)) {
            state["toWordGameState"] = "false";
            return;
        }

        // state["error"] = "Должно быть по одному капитану в каждой команде";
        // state["toWordGameState"] = "false";

    }

};