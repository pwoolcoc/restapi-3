module.exports = {
    all: function(app) {
        var configs = app.configs
        return function(args) {
            var repsonse;
            var all_configs = configs.read("*", function(err, result) {
                response = {
                    status: 200,
                    content: JSON.stringify({ "configurations": result }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                };
            });
            return response;
        };
    },
    create: function(app) {
        var configs = app.configs
        return function(args) {
        };
    },
    get: function(app) {
        var configs = app.configs
        return function(args) {
            var response,
                captures = args.captures,
                name = captures[0],
                config = configs.read({ "name": name }, function(err, result) {
                    if (err) {
                        throw err;
                    }

                    if (result.length < 1) {
                        response = app.error(404, "Not Found");
                    } else {
                        response = app.json_response(result[0]);
                    }
                });
            return response;
        };
    },
    update: function(app) {
        var configs = app.configs
        return function(args) {
        };
    },
    delete: function(app) {
        var configs = app.configs
        return function(args) {
        };
    }
};

