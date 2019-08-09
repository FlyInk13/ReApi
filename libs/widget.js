/* global utils */

function vs(data, gids) {
    return utils.vk.groups.getById({
        group_ids: gids,
        fields: "members_count,photo_100,photo_200"
    }).then((x) => {
        data.res.body.response.widget = {
            "type": 7,
            "data": {
                "title": x[0].name + " vs " + x[1].name,
                "more": "by ReApi",
                "match": {
                    "state": "подписчиков",
                    "team_a": {
                        "name": x[0].name,
                        "descr": "Группа",
                        "icon": [
                            {
                                "url": x[0].photo_100,
                                "width": 100,
                                "height": 100
                            },
                            {
                                "url": x[0].photo_200,
                                "width": 150,
                                "height": 150
                            }
                        ]
                    },
                    "team_b": {
                        "name": x[1].name,
                        "descr": "Группа",
                        "icon": [
                            {
                                "url": x[1].photo_100,
                                "width": 100,
                                "height": 100
                            },
                            {
                                "url": x[1].photo_200,
                                "width": 150,
                                "height": 150
                            }
                        ]
                    },
                    "score": {
                        "team_a": x[0].members_count,
                        "team_b": x[1].members_count
                    }
                },
                "title_action": {
                    "type": "open_url",
                    "url": "https://vk.com/re_api",
                    "target": "internal"
                },
                "more_action": {
                    "type": "open_url",
                    "url": "https://vk.com/re_api",
                    "target": "internal"
                }
            }
        };
        return data;
    });
}

var gids = {
    "146086776": "146086776,23956131",
    "147591239": "147591239,club1",
    "70087578": "70087578,132093730",
    "132093730": "132093730,70087578"
};
module.exports = {
    name: "widget",
    methods: ["execute.getFullGroupNewNew"],
    edit_res: (data) => {
        if (gids[data.req.body.group_id]) return vs(data, gids[data.req.body.group_id]);
    }
};
