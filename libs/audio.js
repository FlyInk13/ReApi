/* jshint esversion: 6 */
/* global utils */


module.exports = {
    name: "audio",
    methods: [
        "audio.get", "store.getStockItems", "execute.getMusicPage"
    ],
    edit_res: (data) => {
        if (data.method == "audio.get" && utils.isExist(data, "res.body.response.items")) {
            data.res.body.response.items =
                data.res.body.response.items.map((a) => {
                    a.is_licensed = true;
                    return a;
                });
        } else if (data.method == "execute.getMusicPage" && utils.isExist(data, "res.body.response.audios.items")) {
            data.res.body.response.audios.items =
                data.res.body.response.audios.items.map((a) => {
                    a.is_licensed = true;
                    return a;
                });
        }
    }
};
