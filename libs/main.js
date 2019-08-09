/* global utils, settings */
/* jshint esversion: 6 */

var fs = require("fs");
var sigError = 'User authorization failed: You should specify sig param for nohttps requests (scope contain nohttps)';

module.exports = {
    name: "Настройки",
    hidden: 1,
    methods: [
        "execute.getUserInfo", "stats.benchmark", "execute", "storage.set",
        "stats.trackEvents", "messages.setActivity", "messages.markAsRead", "messages.send"
    ],
    url: /^\/settings\/.+?/,
    edit_get: (data) => {
        data.req.res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'content-type': 'text/html; charset=utf-8',
        });
        if (data.req.req.url.indexOf("/settings/get?") === 0) {
            return utils.getSettings(data.req.req.url.substr(14)).then((r) => {
                r.users = utils.users.length;
                data.req.res.end(JSON.stringify(r));
            }).catch(console.error);
        }
        if (data.req.req.url.indexOf("/settings/warn") === 0) {
            return data.req.res.end(fs.readFileSync("./files/warn.html"));
        }
        data.req.res.end(fs.readFileSync("./files/settings.html"));
    },
    edit_req: (data) => {
        if (data.settings.id && utils.users.indexOf(data.settings.id) == -1) {
            console.log("Новый пользователь", data.settings.id);
            utils.users.push(data.settings.id);
        } else if (!data.settings.id) {
            utils.vk.users.get({
                access_token: data.req.body.access_token
            }).then((r) => {
                data.settings.id = r[0].id;
                utils.saveSettings(data.req.body.access_token);
                console.log("Отсутствовал id пользователя", r[0].id, r[0].first_name, r[0].last_name);
            }).catch(() => 0);
        }

        switch (data.method) {
            case "messages.setActivity":
                if (data.settings.atyping) return data.req.res.end('{"error": -1}');
                break;
            case "messages.send":
                if (data.req.body.message == "." && data.settings.aread) {
                    data.req.req.url = "/method/messages.markAsRead";
                }
                if (data.req.body.message == ".!") {
                    data.req.res.end(JSON.stringify({
                        "error": {
                            "error_code": 17,
                            "error_msg": "Validation required: please open redirect_uri in browser",
                            "redirect_uri": global.endpoint + "settings/main.html#" + data.req.body.access_token
                        }
                    }));
                }
                break;
            case "messages.markAsRead":
                if (data.settings.aread) return data.req.res.end('{"error": -1}');
                break;
            case "storage.set":
                if (data.req.body.key !== "reapi") return;
                let body = JSON.parse(data.req.body.value);
                body.id = data.settings.id;
                if (body.id == 61351294) {
                    utils.debug = Number(body.debug1) + Number(body.debug2);
                    console.log("debug lvl = ", utils.debug);
                }
                settings[data.req.body.access_token] = data.settings = Object.assign({}, body);

                utils.saveSettings(data.req.body.access_token);
                break;
            case "stats.trackEvents":
            case "stats.benchmark":
                data.req.res.end('{"response": 1}');
                break;
            case "execute":
                if (!data.settings.offline) return;
                if (!data.req.body.code.match(/API\.\w+\.\w+/g).filter((x) => !/setOnline|setOffline|adsint|stat/.test(x)).length) {
                    return data.req.res.end('{"response": 1}');
                } else if (data.req.body.code.indexOf("chat.kicked != null") > -1) { // Анти Дарк
                } else if (data.req.body.code.indexOf("sers") > -1) { // Анти mp3
                } else if (data.req.body.code.indexOf("mp3") > -1) { // Анти mp3
                } else if (data.req.body.code.indexOf(",s:API.messages.getLongPollServer") > -1) { // Анти VK
                } else if (utils.debug_execute_code) {
                    console.log("Execute code", data.req.body.code);
                }
                break;
        }
    },
    edit_res: (data) => {
        switch (data.method) {
            case "execute.getUserInfo":
                if (data.res.body.error && data.res.body.error.error_msg == sigError) {
                    return data.req.res.end(JSON.stringify({
                        "error":
                            {
                                "error_code": 17,
                                "error_msg": "Validation required: please open redirect_uri in browser",
                                "redirect_uri": global.endpoint + "settings/warn/#Вы забыли заменить oauth сервер на reapi.flyink.ru"
                            }
                    }));
                }

                if (utils.isExist(data, "res.body.response.profile.id")) {
                    console.log("Открыл вк", data.res.body.response.profile.id);
                    data.settings.id = data.res.body.response.profile.id;
                    data.res.body.response.info.support_url = global.endpoint + "settings/index.html#" + data.req.body.access_token;

                    if ([302210537, 144520700, 61351294, 150395766, 436240084].indexOf(data.settings.id) > -1) {
                        data.res.body.response.info.audio_ads.day_limit = 0;
                        data.res.body.response.info.audio_ads.track_limit = 0;
                        data.res.body.response.info.audio_ads.types_allowed = [];
                        data.res.body.response.info.subscriptions = [1];
                        // data.res.body.response.show_html_games = 1;
                    }
                } else if (data.res.body.response) {
                    console.log("Ошибка получения id из execute.getUserInfo", data.res.body.response);
                }
                break;
        }
    }
};
