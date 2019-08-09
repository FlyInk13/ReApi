/* global utils */

var methods = ["messages.send", "wall.addComment", "wall.createComment", "execute"];

function replaceStickerId(body) {
    if (/\.\.\/doc/.test(body.sticker_id)) {
        body.attachment = body.sticker_id.replace("../../../../", "").replace("?api=1&", "");
        delete body.sticker_id;
    } else if (body.sticker_id < 0) {
        if (utils.sticker_list.indexOf(body.sticker_id * 1) == -1) {
            body.attachment = "doc" + data.settings.id + "_" + (body.sticker_id * -1);
            delete body.sticker_id;
        } else {
            body.attachment = "doc-131495752_" + (-body.sticker_id);
            delete body.sticker_id;
        }
    }
    return body;
}

module.exports = {
    name: "sendStickers",
    methods: methods,
    edit_req: (data) => {
        if (data.method == "execute" && /API.messages\.send\(({.+?})\)/.test(data.req.body.code)) {
            var body = data.req.body.code.match(/API.messages\.send\(({.+?})\)/)[1];
            data.req.body.code =
                data.req.body.code.replace(
                    /API.messages\.send\(({.+?})\)/,
                    "API.messages.send(" + JSON.stringify(
                        replaceStickerId(JSON.parse(body))
                    ) + ")");
        } else {
            data.req.body = replaceStickerId(data.req.body);
        }
    }
};
