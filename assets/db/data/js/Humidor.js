if (bridge.args["switch"] == "constructor") {
    if (bridge.pageArgs != undefined) {
        bridge.call('DbQuery', {
            "sql": "select * from data where key_data = ? and parent_uuid_data = ? order by id_data",
            "args": ["cigar", bridge.pageArgs["link"]["humidor"]],
            "onFetch": {
                "jsInvoke": "Humidor.js",
                "args": {
                    "includeStateData": true,
                    "switch": "checkCountData"
                }
            }
        });
    }
}

if (bridge.args["switch"] == "onRemove") {
    //bridge.log();
    bridge.call('DbQuery', {
        "sql": "delete from data where key_data = ? and uuid_data = ?",
        "args": ["cigar", bridge.args["uuid_cigar"]],
        "onFetch": {
            "jsInvoke": "Humidor.js",
            "args": {
                "includePageArgument": true,
                "switch": "constructor"
            }
        }
    });
}

if (bridge.args["switch"] == "checkCountData") {
    bridge.call('SetStateData', {
        "key": "count",
        "value": bridge.args["fetchDb"].length + ""
    });
    let result = [];
    let brand = {};
    for (let i = 0; i < bridge.args["fetchDb"].length; i++) {
        let curBrand = bridge.args["fetchDb"][i]["value_data"]["brand"];
        if (brand[curBrand] == undefined) {
            brand[curBrand] = [];
        }
        brand[curBrand].push(bridge.args["fetchDb"][i]);
    }

    for (let key in brand) {
        result.push({
            "templateWidgetSrc": "CigarBrandPreview",
            "customSeqType": "template",
            "label": key,
            "count": brand[key].length
        });
        for (let i = 0; i < brand[key].length; i++) {
            brand[key][i]["templateWidgetSrc"] = "CigarPreview";
            if (brand[key].length == 1) {
                brand[key][i]["customSeqType"] = "template_single";
            } else if (i == 0) {
                brand[key][i]["customSeqType"] = "template_first";
            } else if (i == brand[key].length - 1) {
                brand[key][i]["customSeqType"] = "template_last";
            } else {
                brand[key][i]["customSeqType"] = "template_middle";
            }
            result.push(brand[key][i]);
        }
    }

    //bridge.log(brand);
    bridge.call('SetStateData', {
        "key": "CigarList",
        "value": result
    });
}

