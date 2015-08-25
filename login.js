/* Login/Logout API
 *
 * All login/logout API calls are just different HTTP verbs
 * operating on the /session resource. POST-ing to /session,
 * given a correct username and password, will create a new
 * session. DELETE-ing a /session effectively logs the user
 * out, as it destroys that particular session object.
 *
 */

var crypto = require("crypto");

module.exports = {

/*
 * Login
 *
 * Two different ways to create a token using this endpoint:
 *
 *   1. In POST body:
 *
 *      POST /login
 *      Content-Type: application/json
 *
 *      {
 *          "username": "myusername",
 *          "password": "passw0rd"
 *      }
 *
 * and
 *
 *   2. Create string "username:password", base64 encode that string, and
 *      set that as the value of the Authorization header
 *
 *      POST /login
 *      Authorization: dXNlcm5hbWU6cGFzc3dvcmQ=
 *
 *
 * (I am assuming that this API is running over HTTPS, so I am
 * not worried about sending credentials directly in the post body,
 * or base64'd in the Authorization header)
 */
login: function(app) {
    var db = app.users,
        sessions = app.sessions;

    return function(args) {
        var data = args.data,
            headers = args.headers;

        var username, password, response;

        /* Login parameters were included in the POST body */
        if (typeof data.username !== "undefined" &&
                typeof data.password !== "undefined") {
            username = data.username;
            password = data.password;
        } else if (typeof headers["authorization"] !== "undefined") {
            var pair = new Buffer(headers["authorization"], 'base64').toString("utf8").split(":");
            username = pair[0];
            password = pair[1];
        } else {
            return app.error(401, "Unauthorized");
        }

        db.read({ username: username }, function(err, result) {
            if (result.length < 1) {
                response = app.error(401, "Unauthorized");
                return;
            }

            var stored_pass = result[0].password;
            if (password === stored_pass) {
                var token = crypto.pseudoRandomBytes(32).toString('base64');
                sessions[token] = username;
                response = JSON.stringify({ token: token });
            } else {
                response = app.error(401, "Unauthorized");
            }
        });

        return response;
    };
},

/*
 * Logout
 *
 * In order to log out of your session, you must first put your
 * login token in the `Authorization` header.
 *
 * Here is what a typical request to this endpoint would look like:
 *
 *     DELETE /session/username
 *     Authorization: <some base64 string>
 *
 */
logout: function(app) {
    var db = app.users,
        sessions = app.sessions;

    return function(args) {
        var captures = args.captures,
            headers = args.headers;

        var authorization = headers["authorization"],
            username = captures[0];

        if (typeof authorization === 'undefined') {
            return app.error(401, "Unauthorized");
        }

        if (typeof username === 'undefined') {
            return app.error(400, "Bad Request");
        }

        var stored_username = sessions[authorization];

        if (stored_username !== username) {
            return app.error(401, "Unauthorized");
        }

        if (delete sessions[authorization]) {
            return { status: 200, message: "Session successfully deleted" };
        } else {
            return app.error(500, "Server Error");
        }
    };
}

}
