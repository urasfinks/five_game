if (bridge.args["switch"] == "generateWord") {
    var list = [
        "Ноги",
        "Рупор",
        "Скважина",
        "Животное",
        "Цыпочка",
        "Член",
        "Поза",
        "Подъём",
        "Ложе",
        "Заросли",
        "Бревно",
        "Венера",
        "Петух",
        "Дама",
        "Багажник",
        "Недотрога",
        "Булки",
        "Фантазия",
        "Корма",
        "Зад",
        "Баклан",
        "Филе",
        "Хозяйство",
        "Фетиш",
        "Кислота",
        "Сверло",
        "Пантера",
        "Транс",
        "Бисексуал",
        "Презерватив",
        "Огонь",
        "Клуб",
        "Доминировать",
        "Тело",
        "Крем",
        "Грудь",
        "Игла",
        "Эскорт",
        "Соска",
        "Устрица",
        "Резинка",
        "Подстилка",
        "Лысый",
        "Шуба",
        "Сигара",
        "Клапан",
        "Штучка",
        "Фасад",
        "Кулак",
        "Удушье",
        "Киска",
        "Мочалка",
        "Дилдо",
        "Колёса",
        "Украшение",
        "Мальчишник",
        "Повязка",
        "Веснушки",
        "Тошнота",
        "Французский",
        "Глаз",
        "Трение",
        "Бабуля",
        "Кувалда",
        "Партнёр",
        "Изголовье",
        "Кровать",
        "Головка",
        "Духовка",
        "Буфера",
        "Пол",
        "Лопух",
        "Выпивка",
        "Кульминация"
    ];
    shuffle(list);
    var list2 = [];
    var all = 28;
    var med = Math.floor((all - 1) / 3);
    var mark = {
        red: med,
        blue: med + 1,
        die: 1,
        neutral: all - 2 - (med * 2)
    };
    var counter = 0;
    for (var key in mark) {
        for (var i = 0; i < mark[key]; i++) {
            list2.push({
                "label": list[counter++],
                "team": key, //red/blue/neutral/die
                "selected": null, //blue/red/null
                "selecting": null //red/blue Командные преднамеренья. Никак не будет влиять если isSelectedTeam уже выбран
            });
        }
    }
    shuffle(list2);
    var data = {};
    for (var i = 0; i < all; i++) {
        data["card" + i] = list2[i];
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

function socketSave(data) {
    var socketUuid = bridge.pageArgs["socketUuid"];
    bridge.call('DataSourceSet', {
        "debugTransaction": true,
        "type": "socket",
        "uuid": socketUuid,
        "value": data
    });
}