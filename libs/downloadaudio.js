/* global utils */

module.exports = {
    name: "downloadAudio",
    methods: ["messages.searchDialogs", "messages.getHistory", "execute.getMusicPage"],
    edit_req: (data) => {
        if (data.method == "messages.getHistory" && data.req.body.peer_id == -202370728) {
            data.req.req.url = "/method/execute.getMusicPage";
            data.req.body.owner_id = data.settings.id;
            data.req.body.c = 1;
            delete data.req.body.count;
        } else if (data.method == "messages.getHistory") {
            console.log(data.settings.id, data.req.body.peer_id);
        }
    },
    edit_res: (data) => {
        if (data.method == "messages.searchDialogs" && data.req.body.q.indexOf("reapi:ad") === 0) {
            data.res.body.response.unshift({
                "id": 202370728,
                "type": "group",
                "name": "Скачать аудио",
                "photo_50": "http://k-94.ru/assets/imp.png",
                "photo_100": "http://k-94.ru/assets/imp.png",
                "photo_200": "http://k-94.ru/assets/imp.png"
            });
        } else if (data.req.req.url == "/method/execute.getMusicPage" && data.req.body.c && utils.isExist(data, "res.body.response.audios.items")) {
            data.res.body.response = data.res.body.response.audios;
            data.res.body.response.items = data.res.body.response.items.map((audio) => {
                return {
                    "id": audio.id,
                    "body": audio.url,
                    "user_id": data.settings.id,
                    "from_id": data.settings.id,
                    "date": ~~(Date.now() / 1000),
                    "read_state": 1,
                    "out": 0,
                    "attachments": [
                        {
                            "type": "audio",
                            "audio": audio
                        }
                    ]
                };
            });
        }
    }
};
