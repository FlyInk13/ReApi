/* global utils */

const { createCanvas } = require('canvas'),
    canvas = createCanvas(100, 100),
    ctx = canvas.getContext('2d');

ctx.textBaseline = "middle";
ctx.textAlign = "center";
ctx.font = 'bold 36px Roboto,Open Sans';

function replaceChatPhoto100(array) {
    if (!Array.isArray(array)) return array;
    return array.map(function replacePhoto(u) {
        if (u.photo_100 !== "https://vk.com/images/camera_100.png") return u;
        var n = "--";
        if (u.first_name) {
            n = u.first_name.substr(0, 1) + u.last_name.substr(0, 1);
        } else {
            n = u.id;
        }
        for (var i in u) {
            if (/^photo/.test(i)) {
                u[i] = global.endpoint + "photo_100_" + n + ".png";
            }
        }

        return u;
    });
}

module.exports = {
    name: "replaceChatPhoto100",
    methods: ["messages.getChat", "messages.getLongPollHistory", "users.get", "execute.getDialogsWithProfilesNewFixGroups"],
    url: /^\/photo_100_(.+)\.png$/,
    edit_get: (data) => {
        var text = data.req.req.url.match(/^\/photo_100_(.+)\.png$/)[1];
        ctx.fillStyle = "#D32D32";
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(decodeURIComponent(text), 50, 50);
        data.req.res.end(canvas.toBuffer());
    },
    edit_res: (data) => {
        if (data.method == "messages.getChat") {
            if (!utils.isExist(data, "res.body.response.users")) return;
            data.res.body.response.users = replaceChatPhoto100(data.res.body.response.users);
        } else if (data.method == "execute.getDialogsWithProfilesNewFixGroups") {
            if (!utils.isExist(data, "res.body.response.p")) return;
            data.res.body.response.p = replaceChatPhoto100(data.res.body.response.p);
        } else if (data.method == "users.get") {
            if (!utils.isExist(data, "res.body.response")) return;
            data.res.body.response = replaceChatPhoto100(data.res.body.response);
        } else {
            if (!utils.isExist(data, "res.body.response.profiles")) return;
            data.res.body.response.profiles = replaceChatPhoto100(data.res.body.response.profiles);
        }
    }
};
