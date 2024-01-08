if (bridge.args["switch"] === "generateWord") {

    var list = [
        "Повар",
        "Десерт",
        "Суп",
        "Вино",
        "Блюдо",
        "Пицца",
        "Пряности",
        "Приправа",
        "Печь",
        "Завтрак",
        "Обед",
        "Фрукты",
        "Закуска",
        "Печенье",
        "Плов",
        "Сыр",
        "Масло",
        "Лимонад",
        "Торт",
        "Жареный",
        "Салат",
        "Шоколад",
        "Хлеб",
        "Ягоды",
        "Экспедиция",
        "Пляж",
        "Чемодан",
        "Аэропорт",
        "Отдых",
        "Отель",
        "Турист",
        "Экскурсия",
        "Море",
        "Горы",
        "Путешественник",
        "Билет",
        "Виза",
        "Отпуск",
        "Пейзаж",
        "Остров",
        "Навигатор",
        "Рейс",
        "Автобус",
        "Навигация",
        "Приключение",
        "Перелет",
        "Путеводитель",
        "Караван",
        "Компас",
        "Яблоко",
        "Медитация",
        "Бег",
        "Гимнастика",
        "Зож",
        "Массаж",
        "Баскетбол",
        "Йога",
        "Велосипед",
        "Витамины",
        "Зарядка",
        "Спорт",
        "Плавание",
        "Дыхание",
        "Сон",
        "Лечение",
        "Бодибилдинг",
        "Психология",
        "Аэробика",
        "Биатлон",
        "Кардио",
        "Гибкость",
        "Релаксация",
        "Сауна",
        "Эндорфин",
        "Лаборатория",
        "Эксперимент",
        "Робот",
        "Компьютер",
        "Биология",
        "Спутник",
        "Клетка",
        "Генетика",
        "Электроника",
        "Киберспорт",
        "Химия",
        "Молекула",
        "Нанотехнологии",
        "Программирование",
        "Интернет",
        "Алгоритм",
        "Ракета",
        "Дрон",
        "Ядерная энергия",
        "Радио",
        "Телефон",
        "Авиация",
        "Сенсор",
        "Искусственный интеллект",
        "Батарея",
        "Консоль",
        "Развлечение",
        "Аттракцион",
        "Карта",
        "Головоломка",
        "Биллиард",
        "Шахматы",
        "Кинотеатр",
        "Боулинг",
        "Магия",
        "Лотерея",
        "Викторина",
        "Танцы",
        "Фестиваль",
        "Квест",
        "Театр",
        "Фокус",
        "Караоке",
        "Казино",
        "Картинг",
        "Сказка",
        "Комикс",
        "Аквапарк",
        "Парк аттракционов",
        "Рулетка",
        "Лес",
        "Озеро",
        "Река",
        "Горы",
        "Закат",
        "Цветок",
        "Дерево",
        "Пустыня",
        "Водопад",
        "Океан",
        "Песок",
        "Скала",
        "Звезда",
        "Земля",
        "Луна",
        "Трава",
        "Облако",
        "Ветер",
        "Солнце",
        "Гриб",
        "Планета",
        "Весна",
        "Галактика",
        "Пляж",
        "Снег"
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