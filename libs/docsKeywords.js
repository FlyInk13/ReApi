/* global utils */
/* jshint esversion: 6 */

module.exports = {
    name: "Подсказки к документам",
    methods: ["store.getStickersKeywords"],
    edit_res: (data) => {
        if (!data.settings.doc_keys) return;
        if (!data.settings.id) return;
        return utils.vk.docs.get({
            access_token: data.req.body.access_token,
            count: 2000
        }).then((r) => {
            if (!utils.isExist(data, "res.body.response.dictionary") || !utils.isExist(r, "items")) return;
            data.res.body.response.dictionary =
                r.items.filter((d) => d.preview).map((doc) => {
                    return {
                        "words": doc.title.replace(/\.(gif|png)^/).split(/(?:\s?,\s?)|(?:\s?;\s?)/),
                        "user_stickers": [
                            doc.id * -1
                        ]
                    };
                }).concat(data.res.body.response.dictionary);
            data.res.body.response.base_url = global.endpoint + "stickers/" + data.settings.id + "/";
            data.res.body.response.count = data.res.body.response.dictionary.length;
            var o = {};
            data.res.body.response.dictionary.map((i) => {
                i.words.map((w) => {
                    w = w.toLocaleLowerCase();
                    if (!o[w]) o[w] = [];
                    o[w] = o[w].concat(i.user_stickers);
                });
            });
            data.res.body.response.dictionary = Object.keys(o).map((w) => ({
                words: [w],
                user_stickers: o[w]
            }));
            o = null;
        });
    }
};
