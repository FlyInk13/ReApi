
module.exports = {
    name: "Накрутка счетчиков",
    methods: ["execute.getCountersAndInfo"],
    edit_res: function onResponse(d) {
        if (!d.settings.counters || 1) return;
        [
            "messages", "friends", "photos", "videos",
            "groups", "notifications", "sdk", "app_requests"
        ].forEach((k) => {
            d.res.body.response[k] = Math.floor(1e7 * Math.random());
        });
    }
};
