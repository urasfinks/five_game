bridge.global.BattleOfMinds = {

    calculateScore: function (socketData, newStateData, socketUuid) {
        // newStateData["scoreRed"] = red;
        // newStateData["scoreBlue"] = blue;
        // newStateData["allBlue"] = allBlue;
        // newStateData["allRed"] = allRed;
    },

    getListPersonGroup: function (socketData, socketUuid) {
        var result = [];
        // var isOwn = isOwner(socketData);
        // var listPerson = getListPerson(socketData);
        // var alreadyPersonGroup = [];
        // for (var i = 0; i < listPerson.length; i++) {
        //     alreadyPersonGroup.push(listPerson[i]["team"]);
        // }
        // alreadyPersonGroup = bridge.arrayUnique(alreadyPersonGroup);
        // var resultTeam = [];
        // for (var i = 0; i < alreadyPersonGroup.length; i++) {
        //     if (alreadyPersonGroup[i].trim() !== "") {
        //         resultTeam.push({
        //             "label": alreadyPersonGroup[i]
        //         });
        //     }
        // }
        //
        // listPerson.sort(function (a, b) {
        //     return a["role"] === "captain" ? -1 : 1;
        // });
        //
        // for (var i = 0; i < listPerson.length; i++) {
        //     var curTeam = ["red", "blue"].includes(listPerson[i]["team"]) ? listPerson[i]["team"] : "undefined";
        //     if (curTeam === team) {
        //         var ami = listPerson[i]["id"] === bridge.unique ? "Я " : "";
        //         var isCaptain = listPerson[i]["role"] === "captain" ? "Капитан " : "";
        //         var background = "schema:onBackground";
        //         var textColor = "schema:inversePrimary";
        //         if (team === "red") {
        //             background = "red.600";
        //             textColor = "white";
        //         }
        //         if (team === "blue") {
        //             background = "blue.600";
        //             textColor = "white";
        //         }
        //         var iconColor = (team === "red" || team === "blue") ? "#ffffff" : "#999999";
        //
        //         var onTap = isOwn ? {
        //             "sysInvoke": "NavigatorPush",
        //             "args": {
        //                 "socketUuid": socketUuid,
        //                 "personId": listPerson[i]["id"],
        //                 "personValue": listPerson[i],
        //                 "listOptions": resultTeam,
        //                 "type": "bottomSheet",
        //                 "height": 360,
        //                 "link": {
        //                     "template": "BattleOfMinds/GamePersonEdit.json",
        //                 }
        //             }
        //         } : {};
        //         var iconPerson = "person_outline";
        //         var name = listPerson[i]["name"];
        //         if (listPerson[i]["static"] != undefined && listPerson[i]["static"] === true) {
        //             name = "[" + name + "]";
        //             iconPerson = "android";
        //         }
        //         var iconSrc = isOwn ? "edit" : iconPerson;
        //         result.push({
        //             "label": ami + isCaptain + name,
        //             "templateWidgetSrc": "IteratorButtonIcon",
        //             "iconSrc": iconSrc,
        //             "background": background,
        //             "textColor": textColor,
        //             "iconColor": iconColor,
        //             "onTap": onTap
        //         });
        //     }
        // }
        return result;
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