/* jshint esversion: 6 */
/* global utils */
var image_reg = /(https:\/\/[^\s]+?\.(?:png|jpe?g))/gi;

module.exports = {
    name: "Бот",
    hidden: 1,
    methods: ["messages.send"],
    edit_req: function(data) {
        if (!data.settings.qsearch) return;
        var q;
        delete data.req.body.sig;
        if (/^@a(\d+)?\s(.+)/.test(data.req.body.message)) {
            q = data.req.body.message.match(/^@a(\d+)?\s(.+)/);
            return utils.vk.audio.search({
                reject_captcha: true,
                q: q[2],
                count: q[1] || 1,
                access_token: data.req.body.access_token
            }).then((r) => {
                data.req.body.message = "";
                data.req.body.attachment = r.items.map((x) => "audio" + x.owner_id + "_" + x.id).join(",");
            });
        } else if (/((?:youtube\.com\/watch\?v=|youtu\.be\/)[a-z-_0-9]+)(?:.t=([0-9]+))?/i.test(data.req.body.message) && !data.req.body.attachment) {
            q = data.req.body.message.match(/((?:youtube\.com\/watch\?v=|youtu\.be\/)[a-z-_0-9]+)(?:.t=([0-9]+))?/i);
            return utils.request("https://" + q[1]).then((p) => {
                p = p.toString().match(/title>(.+?)</);
                p = p ? p[1] : "";
                return utils.vk.video.save({
                    link: "https://" + q[1],
                    reject_captcha: true,
                    is_private: 1,
                    title: p,
                    name: p,
                    access_token: data.req.body.access_token
                });
            }).then((r) => {
                data.req.body.attachment = "video" + r.owner_id + "_" + r.video_id;
                return (/^https/.test(r.upload_url) ? utils.https : utils.http).get(r.upload_url);
            }).then((r) => {
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, 200);
                });
            }).catch(console.error);
        } else if (image_reg.test(data.req.body.message) && !data.req.body.attachment) {
            var l = data.req.body.message.match(image_reg)[0];
            return utils.vk.request(l).then((b) => {
                return utils.vk.upload.messagesPhoto({
                    get: {
                        access_token: data.req.body.access_token
                    },
                    files: {
                        photo: {
                            buffer: b
                        }
                    },
                    save: {
                        reject_captcha: true,
                        access_token: data.req.body.access_token
                    }
                });
            }).then((r) => {
                data.req.body.attachment = "photo" + r[0].owner_id + "_" + r[0].id;
            }).catch(console.error);
        } else if (/(instagram\.com\/p\/.+?\/)/i.test(data.req.body.message) && !data.req.body.attachment) {
            q = data.req.body.message.match(/(instagram\.com\/p\/.+?\/)/i);
            return utils.vk.request("https://www." + q +"media/?size=l").then((b) => {
                return utils.vk.upload.messagesPhoto({
                    get: {
                        access_token: data.req.body.access_token
                    },
                    files: {
                        photo: {
                            buffer: b
                        }
                    },
                    save: {
                        reject_captcha: true,
                        access_token: data.req.body.access_token
                    }
                });
            }).then((r) => {
                data.req.body.attachment = "photo" + r[0].owner_id + "_" + r[0].id;
            }).catch(console.error);
        } else if (/^@g(\d+)?\s(.+)/.test(data.req.body.message)) {
            q = data.req.body.message.match(/^@g(\d+)?\s(.+)/);
            return utils.vk.docs.search({
                q: q[2],
                count: 20,
                reject_captcha: true,
                access_token: data.req.body.access_token
            }).then((r) => {
                data.req.body.message = "";
                data.req.body.attachment = r.items.filter((x) => x.ext == "gif").map((x) => "doc" + x.owner_id + "_" + x.id).splice(0, q[1] || 1).join(",");
            }).catch(console.error);
        }
    }
};
