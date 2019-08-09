/* global utils */
/* jshint esversion: 6 */

module.exports = {
    name: "Подсказки к документам",
    methods: ["store.getStickersKeywords", "messages.send"],
    url: /^\/stickers\/(\d+)\/(-?\d+)\/.+/,
    edit_get: (data) => {
        var st = data.req.req.url.match(/^\/stickers\/(\d+)\/(-?\d+)\/.+/);
        if (!st) return data.req.res.end("stickers !st");
        if (st[2] < 0) {
            if (utils.sticker_list.indexOf(st[2] * 1) > -1) {
                data.req.res.writeHead(302, { location: "https://vk.com/doc-131495752_" + (-st[2]) + "?api=1" });
            } else {
                data.req.res.writeHead(302, { location: "https://vk.com/doc" + st[1] + "_" + (-st[2]) + "?api=1" });
            }
        } else {
            data.req.res.writeHead(302, { location: "https://vk.com/images/stickers/" + st[2] + "/512.png" });
        }

        return data.req.res.end();
    }
};
