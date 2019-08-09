/* global utils */

var querystring = require('querystring');

module.exports = {
    name: "Авторизация",
    hidden: 1,
    url: /^\/token/,
    edit_get: (data) => {
        return new Promise((resolve, reject) => {
            if (/^\/token1/.test(data.req.req.url)) {
                data.req.req.method = "POST";
                utils.getBody(data.req.req, (body) => {
                    data.req.res.writeHead(301, { 'location': 'https://oauth.vk.com/oauth/token?' + body });
                    data.req.res.end();
                    resolve();
                });
                return;
            }


            var req = data.req.req,
                res = data.req.res,
                body = querystring.parse(req.url.replace(/^\/(token|oauth\/token)?/, ""));
            console.log(body);
            body.scope = "offline";
            if (body.username == "null") {
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                utils.httpsGet("https://api.vk.com/method/users.get?v=5.63&access_token=" + body.password, (user) => {
                    if (user.error) return res.end('{"error":"wrong_password","error_description":"Неверный токен"}');
                    console.log("Авторизовался по токену", user.response[0].id);
                    res.end(JSON.stringify({
                        access_token: body.password,
                        expires_in: 0,
                        user_id: user.response[0].id,
                        secret: 12345678
                    }));
                    resolve();
                }, JSON);
            } else {
                utils.httpsGet("https://oauth.vk.com" + req.url.replace("nohttps", "140492287"), (body) => {
                    body = JSON.parse(body);
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    if (body.access_token) {
                        console.log("Авторизовался", body.user_id);
                        body.secret = 12345678;
                    } else {
                        console.log("Ошибка авторизации:", body.error_description || body);
                    }
                    res.end(JSON.stringify(body));
                    resolve();
                });
            }
        });
    }
};
