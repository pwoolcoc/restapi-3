var Server = require("./server"),
    DB = require("./db"),
    login = require("./login"),
    crypto = require("crypto"),
    sessions = {},
    app = new Server({ debug: true }),
    user_db = new DB("users.dat"),
    config_db = new DB("configurations.dat");


app.sessions = sessions;
app.users = user_db;
app.configs = config_db;

/* Login-related endpoints */
app.post("/session", login.login(app));
app.delete(new RegExp(/^\/session\/(\w+)$/), login.logout(app));

app.serve();
