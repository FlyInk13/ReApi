/* global utils */

module.exports = {
    name: "Добавить граффити",
    methods: ["messages.getById", "execute.resolveScreenName"],
    edit_res: (data) => {
        if (data.method == "messages.getById" && utils.isExist(data.res.body, "response.items.0.attachments.1.link.button.action.url")) {
            if (data.res.body.response.items[0].user_id !== -131495752) return;
            if (!data.res.body.response.items[0].attachments[0].doc) return;
            var d = data.res.body.response.items[0].attachments[0].doc;
            data.res.body.response.items[0].attachments[1].link.title = "Добавить граффити";
            data.res.body.response.items[0].attachments[1].link.button.action.url =
                data.res.body.response.items[0].attachments[1].link.url = "https://vk.com/app6098333_" + d.id;
        } else if (data.method == "execute.resolveScreenName" && data.req.body.screen_name == 'app6098333') {
            console.log(">add graffiti>", data.res.body);
            return utils.vk.docs.add({
                owner_id: -131495752,
                doc_id: data.req.body.owner_id,
                access_token: data.req.body.access_token
            }).then((r) => {
                data.res.body.response.embedded_uri.view_url = global.endpoint + "settings/warn#Добавлено";
                return data;
            }).catch(() => {
                data.res.body.response.embedded_uri.view_url = global.endpoint + "settings/warn#Ошибка";
                return data;
            });
        }
    }
};
