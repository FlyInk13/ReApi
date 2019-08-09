/* global utils */

var { createCanvas, loadImage } = require('canvas'),
    bg_cache = {};

module.exports = {
    name: "drawGraffitiPackBg",
    url: /^\/dgpBg\/(\d+)/,
    methods: [],
    edit_get: function edit_get(data) {
        var req = data.req.req,
            res = data.req.res,
            st = req.url.match(/^\/dgpBg\/(\d+)/);

        if (!st) return res.end("dgpBg !st");

        return utils.vk.request("https://vk.com/doc-131495752_" + st[1] + "?api=1").then(loadImage).then(function draw(background) {
            var canvas = createCanvas(background.width, background.height),
                ctx = canvas.getContext('2d');
            ctx.fillStyle = "#eee";
            ctx.fillRect(0, 0, background.width, background.height);
            ctx.globalAlpha = 0.3;
            ctx.translate(background.width / 2, background.height / 2);
            ctx.rotate(45 * Math.PI / 180);
            ctx.drawImage(background, -background.width / 4, -background.height / 4, background.width / 2, background.height / 2);
            bg_cache[st[1]] = canvas.toBuffer();
            res.end(canvas.toBuffer());
        }).catch(function onError(e) {
            console.error("Ошибка отрисовки фона граффити-набора:", e);
            res.end();
        });
    }
};
