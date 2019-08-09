/* global utils */

module.exports = {
    name: "autoUsersAdd",
    methods: ["groups.join"],
    edit_res: (data) => {
        if (data.req.body.group_id == 150512579 && data.settings.id) {
            utils.vk.groups.approveRequest({
                group_id: 150512579,
                user_id: data.settings.id,
                access_token: ""
            }).then((r) => {
                console.log("Одобрена заявка в ReApi", data.settings.id);
            }).catch((e) => {
                console.log("Ошибка принятия заявки", data.settings.id, e);
            });
        }
    }
};
