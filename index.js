/* Login/Logout API
 *
 * All login/logout API calls are just different HTTP verbs
 * operating on the /session resource. POST-ing to /session,
 * given a correct username and password, will create a new
 * session. DELETE-ing a /session effectively logs the user
 * out, as it destroys that particular session object.
 *
 */

var Server = require("./server"),
    db = require("./db"),
    login = require("./login"),
    app = new Server({ debug: true }),
    crypto = require("crypto"),
    sessions = {}; 

app.post("/session", login.login(app, db, sessions));
app.delete(new RegExp(/^\/session\/(\w+)$/), login.logout(app, db, sessions));
app.serve();
