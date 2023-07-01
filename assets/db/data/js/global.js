if (typeof Bridge == 'undefined') {
    class Bridge {
        scriptUuid;
        unique;
        pageUuid;
        args;
        container;
        context;
        state;
        pageArgs;

        constructor() {
            this.clearAll();
        }

        clearAll() {
            this.pageUuid = undefined;
            this.args = undefined;
            this.container = undefined;
            this.context = undefined;
            this.state = undefined;
            this.pageArgs = undefined;
        }

        call(invoke, args) {
            args["_rjduPageUuid"] = this.pageUuid; //Зарезервированное системное имя, что бы связать контекст исполнения
            var result = sendMessage(invoke, JSON.stringify(args));
            if (result == undefined || result == null) {
                return;
            }
            try {
                return JSON.parse(result);
            } catch (e) {
                bridge.log("Exception Bridge.call(" + invoke + ", " + JSON.stringify(args) + "): " + e.toString() + " => " + result);
            }
            return result;
        }

        alert(data) {
            this.call("Alert", {
                "duration": 7000,
                "label": data
            });
        }

        log(data) {
            console.log("scriptUuid: " + bridge.scriptUuid + " ; switch: " + bridge.args["switch"] + "; data: " + JSON.stringify(data));
        }

        overlay(refObject, newValue) {
            for(var key in newValue){
                refObject[key] = newValue[key];
            }
        }
    }

    var bridge = new Bridge();
}
////var data = bridge.call('Template', {
////    "uuid": "${container(root, template.meta.title)}"
////});
////var result = sendMessage('NavigatorPush', JSON.stringify(jsonArgs));
////var result = sendMessage('NavigatorPush', JSON.stringify(jsonArgs));
//var get = bridge.call('DataSourceGet', {
//    "uuid": jsonArgs["uuid"]
//});
//get["x"]++;
//bridge.call('DataSourceSet', {
//    "uuid": jsonArgs["uuid"],
//    "data": get
//});
///*bridge.call('DataSourceSet', {
//    "uuid": "FloatingActionButton.json",
//    "data": {}
//});*/
//bridge.call('Alert', {
//    'action': true
//});
////JSON.stringify({"result": data});
/*
var get = bridge.call('DataSourceGet', {
    "uuid": 'main.json'
});*/