/* eslint-disable new-cap */
/* jshint esversion: 6 */
/* global utils, settings */

var https = require("https"),
    http = require("http"),
    querystring = require('querystring'),
    VK = require('VK-Promise'),
    config = require('./config'),
    vk = VK("", {
        body: {
            reject_captcha: true,
            v: "5.45"
        },
        timeout: 5000
    }),
    fs = require('fs'),
    libs = [];

global.settings = {};

process.env.LC_TIME = "ru_RU.UTF-8";
process.env.TZ = "Europe/Moscow";

var server = http.createServer(function onRequest(req, res) {
    var data = {
        req: {
            req: req,
            res: res
        },
        res: {}
    };

    setTimeout(() => {
        if (res && !res.finished) res.end("");
        data = req = res = null;
    }, 25000);

    if (/^\/oauth\/token/.test(req.url)) {
        req.method = "GET";
        req.url = "/token1";
    }
    if (req.method == "GET" && req.url.indexOf("/method/") !== 0) {
        var getHandlers = libs
            .filter((l) => l.url && l.edit_get && l.url.test(req.url))
            .map((l) => l.edit_get);

        utils.pReduce(data, getHandlers).then(function findGetHandler(data) {
            if (data.req.res.finished) return;

            res.writeHead(302, {
                location: "https://vk.com/reapi"
            });
            return res.end();
        });
    } else {
        utils.getBody(req, function findPostHandler(body) {
            data.method = req.url.substr(8);
            data.req.body = querystring.parse(body);
            delete data.req.body.sig;

            if (!data.req.body.access_token) {
                return data.req.res.end('{"error":"wrong_password","error_description":"Отсутствует access_token"}');
            }

            utils.getSettings(data.req.body.access_token).then(function getPostHandlers(_settings) {
                settings[data.req.body.access_token] = data.settings = _settings;
                var postRequestHandlers = libs
                    .filter((l) => l.edit_req && l.methods.indexOf(data.method) > -1)
                    .map((l) => l.edit_req);

                utils.pReduce(
                    data,
                    postRequestHandlers
                ).catch(function onError(e) {
                    console.error("Ошибка обработки запроса", e);
                    return data;
                }).then(function sendPostRequest(data) {
                    if (data.req.res.finished) {
                        data = req = res = null;
                        return;
                    }
                    data.res.req = https.request({
                        host: "api.vk.com",
                        path: req.url,
                        port: 443,
                        method: "POST",
                        headers: {
                            "user-agent": data.req.req.headers["user-agent"] || ""
                        }
                    }, function getPostResponse(res) {
                        data.res.res = res;
                        utils.getBody(res, function parsePostResponse(body) {
                            try {
                                data.res.body = JSON.parse(body);
                            } catch (e) {
                                console.error("Ошибка парсинга", body, e);
                                return data.req.res.end(JSON.stringify(data.res.body));
                            }

                            var postResponseHandlers = libs.filter((l) => l.edit_res && l.methods.indexOf(data.method) > -1).map((l) => l.edit_res);
                            utils.pReduce(
                                data,
                                postResponseHandlers
                            ).then(function sendResponse(data) {
                                if (!data.req.res.finished) {
                                    data.req.res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                                    data.req.res.end(JSON.stringify(data.res.body));
                                }


                                data = req = res = null;
                            }).catch(function onError(e) {
                                console.error("Ошибка обработки ответа", e);
                                return data;
                            });
                        });
                    });
                    data.res.req.on("error", function onError(e) {
                        console.log("Ошибка получения ответа", e);
                        if (!data.req.res.finished) {
                            data.req.res.end(JSON.stringify(data.res.body));
                        }
                        data = req = res = null;
                    });
                    data.res.req.end(querystring.stringify(data.req.body));
                });
            }).catch(function onError(e) {
                console.error("Ошибка получения настроек", e);
                if (!data.req.res.finished) {
                    data.req.res.end('{"error":{"error_code":-1,"error_msg":"Ошибка получения настроек"}}');
                }
                data = req = res = null;
            });
        });
    }
});
server.setTimeout(10000);
server.listen(config.server.port);

global.utils = {
    packs: [],
    libs,
    edit: function editEncodedData(encoder, data, callback) {
        data = encoder.parse(data);
        callback(data);
        return encoder.stringify(data);
    },
    getBody: function getStreamBody(input, callback) {
        if (input.method == "GET") {
            var p = input.url.split("?");
            input.url = p[0];
            return callback(p[1]);
        }
        var buffers = [];
        input.on("data", (c) => buffers.push(c));
        input.on("end", () => callback(Buffer.concat(buffers).toString()));
    },
    httpsGet: function httpsGet(url, cb, parser) {
        https.get(url, (res) => utils.getBody(res, function parseResponse(body) {
            cb(parser ? parser.parse(body) : body, res);
        })).on("error", function onError(error) {
            console.error("REQ Error", error);
        });
    },
    isExist: function isExist(a, b, r) { // проверка пути в обьекте - https://www.npmjs.com/package/is-exist
        if (!a) return false;
        if (!b) return true;
        if (typeof b == "string") b = b.split(".");
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a = a[b[i]];
                if (!a) return false;
            }
        }
        return r ? a : true;
    },
    pReduce: function pReduce(start, promises) {
        return (function n(start) {
            var p = promises.shift();
            if (!p) return Promise.resolve(start);
            return Promise.resolve(start).then(p)
                .then(function onPromiseResponse(r) {
                    if (r !== start) return start;
                    return r;
                }).catch(function onPromiseError(e) {
                    console.error("Error in pReduce", e);
                    return start;
                }).then(n);
        })(start);
    },
    saveSettings(access_token) {
        if (!access_token || !settings[access_token]) return;

        return vk("storage.set", {
            key: "reapi",
            value: JSON.stringify(settings[access_token]),
            access_token: access_token
        }).then(function onSettingsResponse(r) {
            console.log("Настройки сохранены", settings[access_token].id);
        }).catch(function onSettingsError(e) {
            console.log("Ошибка сохранени настроек", settings[access_token].id, e);
        });
    },
    getSettings: function getSettings(access_token) {
        return new Promise(function buildPromise(resolve, reject) {
            if (!access_token) return reject({});
            if (settings[access_token]) return resolve(settings[access_token]);
            return vk("storage.get", {
                key: "reapi",
                access_token: access_token
            })
                .then(vk.tryJSON)
                .catch(() => ({
                    offline: 1,
                    aread: 1,
                    atyping: 1,
                    voice2text: 1,
                    graffiti: 1,
                    packs: {}
                })).then(resolve, reject);
        });
    },
    reload_module: function rlm(name) {
        var module = "./libs/" + name + ".js";
        delete require.cache[require.resolve(module)];
        libs = libs.filter((lib) => lib._name !== name);
        var lib = require(module);
        lib._name = name;
        libs.push(lib);
    },
    request: vk.request,
    vk: vk,
    VK: VK,
    endpoint: config.endpoint,
    config: config,
    https: https,
    http: http,
    debug: 0,
    users: []
};


libs = fs.readdirSync("./libs/").map(function loadModules(cur) {
    var _name = cur.replace(".js", ""),
        lib = require("./libs/" + cur);
    lib._name = _name;
    return lib;
});

process.on("uncaughtException", function onException(e) { // Игнорирование ошибок
    console.error("uncaughtException", e.stack);
});

process.on('unhandledRejection', (err, p) => {
    console.error('unhandledRejection', {
        error: err,
        promis: p
    });
});
