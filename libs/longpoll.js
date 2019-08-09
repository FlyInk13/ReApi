/* global utils */
/* jshint esversion: 6 */

var crypto = require("vk-crypto.js");
var image_reg = /(https?:\/\/[^\s]+?\.(?:png|jpe?g))/gi;

module.exports = {
    name: "Настройки",
    hidden: 1,
    methods: [
        "execute", "messages.send", "messages.getLongPollServer", "messages.getById",
        "messages.getHistory", "messages.getLongPollHistory", "lptest"
    ],
    url: /^\/lp\/.*/,
    edit_get: (data) => {
        return new Promise((resolve, reject) => {
            var server = "https://" + data.req.req.url.substr(4);
            utils.httpsGet(server, (body, _res) => {
                data.req.res.writeHead(_res.statusCode, {
                    'content-type': 'text/javascript; charset=UTF-8',
                    pragma: 'no-cache',
                    'cache-control': 'no-store'
                });

                if (body.updates) {
                    body.updates = body.updates.map((u) => {
                        if (u[0] == 4) u[6] = decrypt(u[6]);
                        if (u[0] == 4 && !(u[2] & 512) && (image_reg.test(u[6]) || /instagram/.test(u[6]))) {
                            u[2] += 512;
                            u[7].attach1 = "0_0";
                            u[7].attach1_type = "photo";
                        }
                        return u;
                    });
                }
                data.req.res.end(JSON.stringify(body));
                resolve();
            }, JSON);
        });
    },
    edit_req: (data) => {
        if (data.method !== "messages.send" || !data.settings.crypto) return;
        // ["COFFEE","Invisible","MP3"]
        if (data.req.body.message && crypto.available_types.indexOf(data.settings.e) > -1) {
            delete data.req.body.sig;
            data.req.body.message = crypto[data.settings.e].encrypt(data.req.body.message);
            if (data.settings.e == "Invisible" && !data.req.body.attachment) {
                data.req.body.attachment = "doc254795005_444913689";
            }
        } else if (/^@(mp3|inv|cof)\s?/i.test(data.req.body.message)) {
            var type = ({
                "mp3": "MP3",
                "inv": "Invisible",
                "cof": "COFFEE"
            })[data.req.body.message.substr(1, 3).toLocaleLowerCase()];
            data.req.body.message = crypto[type].encrypt(data.req.body.message.substr(4));
            if (type == "Invisible" && !data.req.body.attachment) {
                data.req.body.attachment = "doc254795005_444913689";
            }
        }
    },
    edit_res: (data) => {
        if (!data.settings.longpoll) return;
        if (data.method == "execute") {
            if (data.req.body.code.indexOf("s:API.messages.getLongPollServer") == -1 || !data.res.body.response || !data.res.body.response.s) return;
            var lp_sever = global.endpoint + "lp/" + data.res.body.response.s.server;
            data.res.body.response.s.server = lp_sever.replace('https://', '');
        } else if (data.method == "messages.getHistory" && utils.isExist(data.res.body, "response.items.0")) {
            return Promise.all(data.res.body.response.items.map(checkMsg.bind(null, data)));
        } else if (data.method == "messages.getLongPollHistory" && utils.isExist(data.res.body, "response.items.0")) {
            return Promise.all(data.res.body.response.messages.items.map(checkMsg.bind(null, data)));
        } else if (data.method == "messages.getById" && utils.isExist(data.res.body, "response.items.0")) {
            return checkMsg(data, data.res.body.response.items[0]);
        } else if (data.method == "messages.getLongPollServer" && data.res.body.response) {
            var lp_sever = global.endpoint + "lp/" + data.res.body.response.server;
            data.res.body.response.s.server = lp_sever.replace('https://', '');
        }
    }
};


function checkMsg(data, msg) {
    if (data.settings.slinks && /(instagram\.com\/p\/.+?\/)/i.test(msg.body) && !msg.body.attachments) {
        var q = msg.body.match(/(instagram\.com\/p\/.+?\/)/i);
        return new Promise((resolve, reject) => {
            utils.httpsGet("https://" + q[1] + "media/?size=l", (body, _res) => {
                console.log(_res.headers.location);
                msg.attachments = [toImage(_res.headers.location)];
                resolve();
            });
        });
    }

    if (data.settings.slinks && image_reg.test(msg.body)) {
        var imgs = msg.body.match(image_reg);
        if (!msg.attachments) msg.attachments = [];
        msg.attachments = imgs.map(toImage).concat(msg.attachments);
        console.log("Вложено в сообщение:", data.settings.id, imgs.join("; "));
    }
    if (data.settings.crypto) {
        msg.body = decrypt(msg.body);
    }

    if (data.settings.mfilter && msg.body.length > 10 && 0) {
        for (var l = 10; l > 1; l--) {
            if (msg.body.length % l === 0) continue;
            msg.body = msg.body.match(/[^]{2}/g).filter((i, x, a) => i !== a[x - 1]).join("");
        }
    }
    return msg;
}

function decrypt(body) {
    crypto.available_types.map((c) => {
        if (crypto[c].check(body)) {
            var e = crypto[c].decrypt(body);
            if (e && e !== body) body += "\n(" + c + ": " + e + ")";
        }
    });
    return body;
}


function toImage(url) {
    return {
        type: "photo",
        photo: {
            owner_id: 0,
            id: 0,
            text: "ReApi: " + url,
            sizes: ["s", "m", "r", "x", "y"].map((s) => {
                return {
                    type: s,
                    height: 500,
                    width: 500,
                    src: url
                };
            })
        }
    };
}
