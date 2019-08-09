/* global utils */

var verified = [
    23924031, 30898766, 49567337, 52924326, 55329374, 61351294, 71872127,
    86185582, 86248631, 101820717, 105918493, 110161095, 112806016, 143084671,
    144520700, 145567397, 146880457, 156838185, 161428490, 163698852, 191565296,
    198082755, 246378189, 251478003, 254015224, 263618726, 290218852, 329996777,
    436730360, 371410855, 135995595, 206608447, 93787870, 116663568
];

module.exports = {
    name: "Profile",
    methods: ["execute.getFullProfileNewNew"],
    edit_res: (data) => {
        if (!data.res.body.response) return;
        return utils.request("https://vk.com/foaf.php?id=" + data.res.body.response.id)
            .then((r) => {
                r = r.toString().match(/<ya:created dc:date="(.+?)"\/>/);
                if (!r) return;
                var d = new Date(r[1]);

                if (verified.indexOf(data.res.body.response.id) > -1) data.res.body.response.verified = 1;
                if (!data.res.body.response.career) data.res.body.response.career = [];

                if (utils.users.indexOf(data.res.body.response.id) > -1) {
                    data.res.body.response.career.unshift({
                        company: "Пользователь ReApi"
                    });
                }

                data.res.body.response.career.unshift({
                    company: "[ReApi] ID пользователя:",
                    position: data.res.body.response.id
                });

                data.res.body.response.career.unshift({
                    company: "[ReApi] Дата регистрации:",
                    position: d.toLocaleString("ru")
                });
            });
    }
};
