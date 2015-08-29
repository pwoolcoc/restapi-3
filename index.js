var Server = require("./server"),
    DB = require("./db"),
    login = require("./login"),
    config = require("./config"),
    crypto = require("crypto"),
    url = require("url"),
    sessions = {},
    app = new Server({ debug: true }),
    user_db = new DB("data/users.dat"),
    config_db = new DB("data/configurations.dat");


app.sessions = sessions;
app.users = user_db;
app.configs = config_db;
var config_obj_route = /^\/configuration\/(\w+)$/;


/* Login-related endpoints */
app.post("/session", login.login(app));
app.delete(new RegExp(/^\/session\/(\w+)$/), login.logout(app));

/* Config-related endpoints */
app.get('/configuration', is_authed(paginate(config.all(app))));
app.post('/configuration', is_authed(config.create(app)));
app.get(new RegExp(config_obj_route), is_authed(config.get(app)));
app.put(new RegExp(config_obj_route), is_authed(config.update(app)));
app.delete(new RegExp(config_obj_route), is_authed(config.delete(app)));

app.serve();

/* Wrappers for common functionality */
function is_authed(handler) {
    return function(args) {
        var headers = args.headers;

        if (typeof headers === 'undefined') {
            return app.error(401, "Unauthorized");
        }

        var authorization = headers["authorization"];
        if (typeof authorization === 'undefined') {
            return app.error(401, "Unauthorized");
        }

        var session = app.sessions[authorization];
        if (typeof session === "undefined") {
            return app.error(401, "Unauthorized");
        }

        return handler(args);
    };
}

function paginate(handler) {
    return function(args) {
        var result = handler(args);
        if (typeof args.params.page !== "undefined") {
            var uri = args._uri,
                cur_page = parseInt(args.params.page),
                per_page = parseInt(typeof args.params.num !== "undefined" ? args.params.num : "10"),
                next_page_num = cur_page + 1,
                prev_page_num = cur_page - 1,
                next_page = url.format({
                    pathname: uri.pathname,
                    query: {
                        "page": next_page_num,
                        "num": per_page
                    }
                }),
                prev_page = url.format({
                    pathname: uri.pathname,
                    query: {
                        "page": prev_page_num,
                        "num": per_page
                    }
                });
            var obj = JSON.parse(result.content);
            if (typeof obj.links === "undefined") {
                obj.links = {};
            }
            if (prev_page_num > 0) {
                obj.links.prev_page = prev_page;
            }
            obj.links.next_page = next_page;
            result.content = JSON.stringify(obj);
        }
        return result;
    };
};

