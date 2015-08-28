module.exports = {
    URL: "/configuration",
    all: function(app) {
        var configs = app.configs
        return function(args) {
            var repsonse;
            var all_configs = configs.read("*", function(err, result) {
                response = app.json_response({ "configurations": result });
            });
            return response;
        };
    },
    create: function(app) {
        var configs = app.configs,
            self = this;
        return function(args) {
            var response,
                data = args.data;
            configs.read({ "name": data.name }, function(err, result) {
                if (result.length > 0) {
                    response = app.error(400, "Bad Request");
                } else {
                    configs.create(data);
                    var obj = JSON.stringify({ configuration: self.URL + "/" + data.name });
                    response = {
                        status: 201,
                        content: obj,
                        headers: {
                            "Content-Type": "application/json",
                            "Content-Length": obj.length
                        }
                    };
                }
            });
            return response;
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
            var response,
                captures = args.captures,
                name = captures[0],
                data = args.data;

            configs.update({ "name": name }, data);
            return {
                status: 204,
                content: ""
            };
        };
    },
    delete: function(app) {
        var configs = app.configs
        return function(args) {
            var response,
                captures = args.captures,
                name = captures[0];
            var deleted = configs.delete({ "name": name });
            if (deleted) {
                return {
                    status: 204,
                    content: ""
                };
            } else {
                return app.error(404, "Not Found");
            }
        };
    }
};

