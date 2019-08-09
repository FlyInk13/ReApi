/* global utils */
/* jshint esversion: 6 */

var packs = [];
var vks = global.config.vks;

utils.sticker_list = [];
utils.loadPacks = loadPacks;
loadPacks();

function loadPacks() {
    utils.vk.photos.getAlbums({
        owner_id: -139052311,
        access_token: vks
    }).then((r) => {
        var aids = r.items.map((x) => x.id);
        Promise.all(
            aids.map((aid) => utils.vk.photos.get({
                owner_id: -139052311,
                album_id: aid,
                access_token: vks
            }))
                .concat([utils.vk.photos.getAlbums({
                    owner_id: -139052311,
                    album_ids: aids.join(","),
                    access_token: vks
                })])
        ).then((r) => {
            var info = r.pop();
            utils.sticker_list = [];
            packs = [];
            r.map((a, i) => {
                packs.push(drawPack({
                    name: info.items[i].title,
                    background: utils.VK.getAttachmentUrl(a.items[0]),
                    stickers: a.items.map((p) => p.text).join(",").match(/_\d+/g).map((x) => x.substr(1) * -1),
                    id: info.items[i].id
                }));
            });
            console.log("Наборов граффити (" + packs.length + "): " + packs.map((x) => x.product.id + "x" + x.product.stickers.sticker_ids.length).join("; "));
        }).catch(console.error);
    }).catch(console.error);
}

function drawPack(info) {
    var fstickers_path = global.endpoint + "stickers/00/",
        preview = fstickers_path + info.stickers[0] + '/main/';
    utils.sticker_list = utils.sticker_list.concat(info.stickers);
    return {
        product: {
            id: info.id - 241213995,
            type: 'stickers',
            purchased: 1,
            active: 1,
            purchase_date: Date.now(),
            title: info.name,
            base_url: preview,
            stickers: {
                base_url: fstickers_path,
                sticker_ids: info.stickers
            }
        },
        can_purchase: 1,
        id: info.id - 241213995,
        free: 1,
        payment_type: 'balance',
        price: 0,
        price_str: '0 руб.',
        active: 1,
        merchant_product_id: "stickers" + (2e5 + info.id),
        photo_35: preview,
        photo_70: preview,
        photo_140: preview,
        photo_296: preview,
        photo_592: preview,
        background: info.background || preview,
        base_url: preview,
        demo_photos_560: [
            fstickers_path + info.stickers[0] + '/main/512.png',
            fstickers_path + info.stickers[1] + '/main/512.png',
            fstickers_path + info.stickers[2] + '/main/512.png'
        ]
    };
}

module.exports = {
    name: "Наборы фейковых граффити",
    methods: ["store.getProducts", "execute.getStickerProducts", "store.reorderProducts", "store.activateProduct", "store.deactivateProduct"],
    edit_req: (data) => {
        if (!data.settings.graffiti) return;
        if (data.settings.packs) delete data.settings.packs;
        if (!data.settings.gplist) data.settings.gplist = [];


        if (data.req.body.product_id > 1999) {
            if (!data.settings.packs) data.settings.packs = {};
            if (data.method == "store.reorderProducts") {
                return data.req.res.end('{"response":1}');
            } else if (data.method == "store.activateProduct") {
                console.log("product_id +++", data.settings.id, "\t", data.req.body.product_id);
                if (data.settings.gplist.indexOf(data.req.body.product_id * 1) == -1) {
                    data.settings.gplist.push(data.req.body.product_id * 1);
                }
                utils.saveSettings(data.req.body.access_token);
                return data.req.res.end('{"response":1}');
            } else if (data.method == "store.deactivateProduct") {
                console.log("product_id ---", data.settings.id, "\t", data.req.body.product_id);
                var i = data.settings.gplist.indexOf(data.req.body.product_id * 1);
                if (i > -1) data.settings.gplist.splice(i, 1);
                utils.saveSettings(data.req.body.access_token);
                return data.req.res.end('{"response":1}');
            }
        } else if (data.method == "store.activateProduct" || data.method == "store.deactivateProduct") {
            console.log("product_id XXX", data.settings.id, "\t", data.req.body.product_id);
        }
    },
    edit_res: (data) => {
        if (!data.settings.graffiti) return;
        if (data.settings.packs) delete data.settings.packs;
        if (!data.settings.gplist) data.settings.gplist = [];
        if (data.method == "execute.getStickerProducts") {
            if (!utils.isExist(data, "res.body.response.stickers")) return;

            console.log("Активные наборы граффити-стикеров:", data.settings.id, data.settings.gplist.join("; "));

            data.res.body.response.stickers.items = [].concat(packs.map((p, i) => {
                p.active = p.product.active = (data.settings.gplist.indexOf(p.product.id * 1) !== -1) * 1;
                return p;
            }), data.res.body.response.stickers.items);
            data.res.body.response.stickers.count = data.res.body.response.stickers.items.length;
            console.log("execute.getStickerProducts", data.settings.id);
        } else if (data.method == "store.getProducts") {
            if (!utils.isExist(data, "res.body.response.items")) return;
            data.res.body.response.items = [].concat(packs.map((x) => JSON.parse(JSON.stringify(x.product))).map((p) => {
                p.active = (data.settings.gplist.indexOf(p.id * 1) !== -1) * 1;
                p.stickers.sticker_ids =
                    p.stickers.sticker_ids.map((x) => "../../../../doc-131495752_" + (-x) + "?api=1&");
                return p;
            }).filter((x) => x.active), data.res.body.response.items);
            console.log("store.getProducts", data.settings.id);
            data.res.body.response.count = data.res.body.response.items.length;
        }
    }
};
