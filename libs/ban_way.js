/* global utils */
/* jshint esversion: 6 */

module.exports = {
    name: "ban_away",
    methods: ["execute.wallGetWrapNew", "execute.getCommentsNew"],
    edit_res: (data) => {
        if (!data.res.body.execute_errors) return;
        return utils.vk(data.method, Object.assign({
            access_token: "",
        }, data.req.body)).then((response) => {
            if (!response) return;
            response = JSON.stringify({ response });
            data.req.res.end(response);
        });
    }
};
