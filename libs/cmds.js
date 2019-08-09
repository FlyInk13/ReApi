/* global utils */

var fs = require("fs"),
    admins = [61351294],
    roll = `<iframe src="https://www.youtube.com/embed/oHg5SJYRHA0?autoplay=1" frameborder="0" allowfullscreen="" style="width:100%;height:100%;position:fixed;top:0;left:0"></iframe>`;

module.exports = {
    name: "Cmds",
    methods: ["cmd"],
    edit_req: (data) => {
        return utils.vk.users.get({
            access_token: data.req.body.access_token
        }).then((r) => {
            if (admins.indexOf(r[0].id) == -1) {
                data.req.res.end(roll);
            }

            if (data.req.body.message == "show_debug") {
                data.req.res.end(fs.readFileSync("./files/admin.html"));
            } else if (data.req.body.message == "/rlgp") {
                utils.loadPacks();
                data.req.res.end("OK");
            } else if (data.req.body.message.indexOf("/debug ") === 0) {
                utils.debug = data.req.body.message.substr(7) * 1;
                data.req.res.end("OK");
            } else if (data.req.body.message.indexOf("/reload ") === 0) {
                utils.reload_module(data.req.body.message.substr(8));
                data.req.res.end("OK");
            } else {
                data.req.res.end(roll);
            }
        });
    }
};
