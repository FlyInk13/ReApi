/* global utils */

module.exports = {
    name: "test",
    url: /^\/.+/,
    methods: ["search.getTrends", "newsfeed.search"],
    edit_get: (data) => {
        if (data.req.req.url == "/r-users.json") {
            return data.req.res.end(JSON.stringify(utils.users));
        }
        if (data.req.req.url == "/loop") {
            return new Promise(() => 1);
        }
    },
    edit_req: (data) => {
        if (data.method == "newsfeed.search" && data.req.body.q == 'Настройки ReApi') {
            return data.req.res.end({
                "error": {
                    "error_code": 17,
                    "error_msg": "Validation required: please open redirect_uri in browser",
                    "redirect_uri": global.endpoint + "settings/main.html#" + data.req.body.access_token
                }
            });
        }
    },
    edit_res: (data) => {
        if (data.method !== "search.getTrends") return;
        data.res.body.response.items.push({ name: "Настройки ReApi" });
        data.res.body.response.count = data.res.body.response.items.length;
    }
};
