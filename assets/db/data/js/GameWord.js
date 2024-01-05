if (bridge.args["switch"] === "generateWord") {

    var list = [
        "Пляж",
        "Пальма",
        "Океан",
        "Лето",
        "Зонт",
        "Плавательный костюм",
        "Песок",
        "Айсберг",
        "Шезлонг",
        "Серфинг",
        "Микроскоп",
        "Эксперимент",
        "Химия",
        "Биология",
        "Реакция",
        "Пробирка",
        "Ген",
        "Лазер",
        "Атом",
        "Исследование",
        "Небоскреб",
        "Пешеход",
        "Парк",
        "Мост",
        "Трамвай",
        "Фонарь",
        "Площадь",
        "Магазин",
        "Фонтан",
        "Архитектура",
        "Весна",
        "Осень",
        "Зима",
        "Листопад",
        "Снег",
        "Цветение",
        "Тепло",
        "Холод",
        "Первозданность",
        "Заснеженный",
        "Зевс",
        "Медуза",
        "Валькирия",
        "Центавр",
        "Грифон",
        "Ламия",
        "Орёл",
        "Феникс",
        "Гидра",
        "Кентавр",
        "Робот",
        "Интернет",
        "Квантовый",
        "Автоматизация",
        "Дрон",
        "Виртуальный",
        "Нанотехнологии",
        "Искусственный интеллект",
        "Спутник",
        "Разработка"
    ];
    bridge.shuffle(list);
    var list2 = [];
    var all = 24;
    var med = Math.floor((all - 1) / 3);
    var mark = {
        red: med + 1,
        blue: med,
        die: 1,
        neutral: all - 2 - (med * 2)
    };
    var counter = 0;
    for (var key in mark) {
        for (var i = 0; i < mark[key]; i++) {
            list2.push({
                "label": list[counter++],
                "team": key, //red/blue/neutral/die
                "selected": null //blue/red/null
            });
        }
    }
    bridge.shuffle(list2);
    var data = {};
    for (var i = 0; i < all; i++) {
        data["card" + i] = list2[i];
    }
    data["isGeneratedCard"] = true;
    socketSave(data, bridge.pageArgs["socketUuid"]);
}