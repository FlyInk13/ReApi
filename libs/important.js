/* global utils */

var imid = "2000900000";

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

module.exports = {
    name: "getTest",
    hidden: 1,
    methods: ["messages.searchDialogs", "messages.getHistory", "messages.send", "messages.getChat"],
    url: /^\/test?/,
    edit_get: (data) => {
        data.req.res.end("OK" + data.req.req.url);
    },
    edit_req: (data) => {
        if (data.method == "messages.send" && data.req.body.chat_id == 900000) {
            data.req.req.url = "/method/messages.markAsImportant";
            data.req.body.message_ids = data.req.body.forward_messages;
            data.req.body.important = data.req.body.message !== "-" ? 1 : 0;
        } else if (data.method == "messages.getChat" && data.req.body.chat_id == 900000) {
            return utils.vk.messages.get({
                filters: 8,
                access_token: data.req.body.access_token,
                count: 200
            }).then((r) => {
                r = r.items.map((x) => x.user_id).filter(onlyUnique);
                return utils.vk.users.get({
                    fields: data.req.body.fields,
                    access_token: data.req.body.access_token,
                    user_ids: [100, data.settings.id].concat(r).join(",")
                });
            })
                .catch([])
                .then((r) => {
                    data.req.res.end(JSON.stringify({
                        "response": {
                            "id": 900000,
                            "type": "chat",
                            "title": "Избранное",
                            "admin_id": 1,
                            "users": r.map((u) => {
                                u.type = "profile";
                                u.invited_by = 100;
                                return u;
                            }),
                            "push_settings": {
                                "sound": 0,
                                "disabled_until": -1
                            },
                            "photo_50": "http://k-94.ru/assets/imp.png",
                            "photo_100": "http://k-94.ru/assets/imp.png",
                            "photo_200": "http://k-94.ru/assets/imp.png"
                        }
                    }));
                });
        } else if (data.method == "messages.getHistory" && data.req.body.peer_id == imid) {
            data.req.req.url = "/method/messages.get";
            data.req.body.filters = 8;
            delete data.req.body.peer_id;
        }
    },
    edit_res: (data) => {
        if (data.method == "messages.searchDialogs" && data.req.body.q.indexOf("... s") === 0) {
            data.req.res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            data.req.res.end(JSON.stringify({
                "error":
                    {
                        "error_code": 17,
                        "error_msg": "Validation required: please open redirect_uri in browser",
                        "redirect_uri": global.endpoint + "settings/main.html#" + data.req.body.access_token
                    }
            }));
        } else if (data.method == "messages.searchDialogs" && data.req.body.q.indexOf("...") === 0) {
            data.res.body.response.unshift({
                "id": 900000,
                "type": "chat",
                "title": "Избранное",
                "admin_id": 1,
                "users": [1, data.settings.id],
                "photo_50": "http://k-94.ru/assets/imp.png",
                "photo_100": "http://k-94.ru/assets/imp.png",
                "photo_200": "http://k-94.ru/assets/imp.png"
            });
        } else if (data.method == "messages.send" && data.req.body.peer_id == imid) {
            data.res.body = {
                response: 0
            };
        }
    }
};
