/* global utils */
/* jshint esversion: 6 */

module.exports = {
    name: "Дополнительные подсказки стикеров",
    methods: ["store.getStickersKeywords"],
    edit_res: (data) => {
        if (!data.settings.custom_keywords || !data.settings.id) return;
        return utils.vk.request("https://jsons.flyink.ru/" + data.settings.id + ".json")
            .then(utils.vk.tryJSON)
            .then((f) => {
                if (!f.response || !f.response.dictionary) return;
                data.res.body.response.dictionary =
                    f.response.dictionary.concat(data.res.body.response.dictionary);

                var wordsMap = {};
                data.res.body.response.dictionary.map((info) => {
                    info.words.map((word) => {
                        word = word.toLocaleLowerCase();
                        if (!wordsMap[word]) wordsMap[word] = [];
                        wordsMap[word] = wordsMap[word].concat(info.user_stickers);
                    });
                });
                data.res.body.response.dictionary = Object.keys(wordsMap).map((word) => ({
                    words: [word],
                    user_stickers: wordsMap[word]
                }));
                wordsMap = null;

                data.res.body.response.base_url = global.endpoint + "stickers/" + data.settings.id + "/";
                data.res.body.response.count = data.res.body.response.dictionary.length;
                console.error("Подсказок пользователя добавлены", data.settings.id);
                return data;
            }).catch((e) => {
                console.error("Ошибка добавления подсказок пользователя", e);
                return;
            });
    }
};
