/* global utils */

var news = [
    "Правила ReApi:\nНикому не рассказывать о ReApi.\nНикогда никому не рассказывать о ReApi",
    "Теперь тут будут обновления, чтобы их убрать достаточно нажать на крестик в углу",
    "Подсказки к документам теперь группируются с подсказками к стикерам.\nИсправлены новости ReApi.",
    "Изменены id граффити-стикеров, если не загружает или не отправляет, то очистите кэш изображений и перезапустите приложение.\n" +
    "Теперь в беседах у пользователей без аватарок будут инициалы (пока не всегда грузит).",
    "Добавлена настройка \"Дополнительные подсказки стикеров\". Подробнее в группе.",
    "Увы, старую группу не вернуть, но мы создали новую."
];

module.exports = {
    name: "TestMsg",
    methods: ["execute.getNewsfeedSmart", "execute.wallGetWrapNew", "internal.hideUserNotification"],
    edit_req: (data) => {
        if (data.method == "internal.hideUserNotification" && data.req.body.notification_id < 0) {
            data.settings.n = data.req.body.notification_id * -1;
            console.log("Скрыл обновление", data.settings.id, data.settings.n);
            utils.saveSettings(data.req.body.access_token);
            return data.req.res.end('{"response": 1}');
        }
        delete data.req.body.sig;
        if (!data.settings.only_ads) {
            data.req.body.filters = "post,photo,photo_tag";
        }
    },
    edit_res: (data) => {
        if ((!data.settings.n || data.settings.n < news.length) && utils.isExist(data, "res.body.response.notifications")) {
            data.res.body.response.notifications.items =
                news.map((text, id) => toNews(text, id, id == 0 ? "Добро пожаловать в ReApi" : 0))
                    .filter((x) => x.id < -(data.settings.n || 0))
                    .concat(data.res.body.response.notifications.items);
            data.res.body.response.notifications.count = data.res.body.response.notifications.items.length;
        }

        if (data.settings.hide_stories && utils.isExist(data, "res.body.response.stories")) {
            data.res.body.response.stories = {
                items: [],
                count: 0
            };
        }

        if (data.res.body.response && data.res.body.response.items) {
            data.res.body.response.items = data.res.body.response.items.filter((p) => {
                if (p.marked_as_ads || p.post_type == "post_ads" || p.suggest_subscribe) {
                    return !!data.settings.only_ads;
                }
                return !data.settings.only_ads;
            });
        }
    }
};


function toNews(description, id, title) {
    return {
        "id": -id - 1,
        "type": "newsfeed",
        "newsfeed": {
            "title": title || "Новости ReApi",
            "message": description || "Новостей пока нет",
            "layout": "info",
            "images": [
                {
                    "url": "https://fs.flyink.ru/reapi.png",
                    "width": 500,
                    "height": 500
                }
            ],
            "button": {
                "title": "Группа ReApi",
                "action": {
                    "type": "open_url",
                    "url": "https://vk.com/re_api",
                    "target": "internal"
                },
                "style": "cell"
            }
        }
    };
}
