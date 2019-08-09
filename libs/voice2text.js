/* jshint esversion: 6, curly: 0 */
/* global utils */
var cache = {},
    tts_key = global.config.tts_key,
    loading = {};

function voice2text(key, msg) {
    if (utils.isExist(msg, "fwd_messages.0.attachments.0.doc.preview.audio_msg")) return voice2text(msg.fwd_messages[0]).then(msg);
    if (!utils.isExist(msg, "attachments.0.doc.preview.audio_msg")) return Promise.resolve(msg);
    var doc_id = msg.attachments[0].doc.id;
    if (loading[doc_id]) {
        return new Promise((resolve) => {
            loading[doc_id].push((r) => {
                msg.body += r;
                resolve(msg);
            });
        });
    } else if (cache[doc_id]) {
        msg.body += cache[doc_id];
        return Promise.resolve(msg);
    }
    loading[doc_id] = [];

    return utils.request(msg.attachments[0].doc.url, {})
        .then(function sendVoice(b) {
            var uuid = ("a" + msg.attachments[0].doc.owner_id + "b" + doc_id + "e".repeat(32)).replace("-", "c").substr(0, 32);
            return utils.request({
                method: "POST",
                host: "asr.yandex.net",
                path: "/asr_xml?uuid=" + uuid + "&key=" + key + "&topic=queries&lang=ru-RU",
                headers: {
                    "Content-Type": "audio/ogg;codecs=opus"
                }
            }, b);
        }).then(function parseResponse(r) {
            r = r.toString().match(/variant.+>(.+?)<\/variant/);
            if (!r) {
                cache[doc_id] = "(Ошибка распознавания)";
            } else {
                cache[doc_id] = "(Голосовое: " + (r[1]).replace(/&lt;censored&gt;/g, "%цензура%") + ")";
            }
            return cache[doc_id];
        }).catch(function onError(e) {
            if (e.error && e.error.error_code == 423) {
                console.error("Ошибка распознавания голосового сообщения: лимит ключа");
                return "(Ошибка распознавания, лимит ключа)";
            } else if (e.error && e.error.error_code) {
                cache[doc_id] = "(Ошибка распознавания #" + e.error.error_code + ")";
                return cache[doc_id];
            }
            return "(Ошибка распознавания)";
        }).then(function sendResponse(r) {
            msg.body += r;
            if (Array.isArray(loading[doc_id])) loading[doc_id].map((x) => x(r));
            loading[doc_id] = null;
            return msg;
        });
}

module.exports = {
    name: "Расшифровка голосовых сообщений",
    methods: ["messages.getById", "messages.getHistory", "messages.getLongPollHistory"],
    edit_res: function edit_res(d) {
        if (!d.settings.voice2text) return;
        var key = d.settings.tts_key || tts_key;
        switch (d.method) {
            case "messages.getHistory":
                if (!utils.isExist(d.res.body, "response.items.0")) return;
                return Promise.all(d.res.body.response.items.map(voice2text.bind(this, key)));
            case "messages.getLongPollHistory":
                if (!utils.isExist(d.res.body, "response.items.0")) return;
                d.items = d.res.body.response.messages.items;
                return Promise.all(d.items.map(voice2text.bind(this, key)));
            case "messages.getById":
                if (!utils.isExist(d.res.body, "response.items.0")) return;
                return voice2text(key, d.res.body.response.items[0]);
            default:
                //
        }
    }
};
