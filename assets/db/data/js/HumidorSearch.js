if (bridge.args["switch"] == "constructor") {
    bridge.call('DbQuery', {
        "stateKey": "CigarList",
        "sql": "select * from data where key_data = ? order by id_data limit 20",
        "args": ["cigar"]
    });
}

if (bridge.args["switch"] == "onSelect") {
    let cigar = JSON.parse(bridge.args["cigar"]);
    cigar["timestamp"] = new Date().getTime();
    cigar["uuid_cigar"] = bridge.args["uuid_cigar"];

    /*bridge.call("Alert", {
        "label": "Добавлено"
    });*/
    bridge.call('DataSourceSet', {
        "uuid": bridge.call('Uuid', {})["uuid"],
        "value": cigar,
        "parent": bridge.args["uuid_humidor"],
        "type": "userDataRSync",
        "key": "cigar",
        "onPersist": {
            "jsInvoke": "HumidorSearch.js",
            "args": {
                "switch": "complete"
            }
        }
    });
}

if (bridge.args["switch"] == "complete") {
    bridge.call("PageReload", {
        "key": "name",
        "value": "Humidor"
    });
    bridge.call("NavigatorPop", {});
}

if (bridge.args["switch"] == "onChange") {
    let args = ["cigar"];
    let sql = "select * from data where key_data = ? order by id_data limit 20"
    if (bridge.state["SearchValue"].trim() != "") {
        let exp = bridge.state["SearchValue"].split(" ");
        let subSql = [];
        for (let i = 0; i < exp.length; i++) {
            args.push("%" + exp[i] + "%");
            subSql.push("value_data like ?");
        }
        sql = "select * from data where key_data = ? and " + subSql.join(" and ") + " order by id_data limit 20";
    }
    bridge.call('DbQuery', {
        "stateKey": "CigarList",
        "sql": sql,
        "args": args
    });
}

/*"onTap": {
                "jsInvoke": "HumidorSearch.js",
                "args": {
                  "cigar": "${value_data|jsonEncode()}",
                  "uuid_cigar": "${uuid_data}",
                  "uuid_humidor": "${pageArgument(humidor)}",
                  "switch": "onSelect",
                  "templateArguments": [
                    "cigar",
                    "uuid_cigar",
                    "uuid_humidor"
                  ]
                }
              }*/