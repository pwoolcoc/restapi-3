
module.exports = {
    all: function(app) {
        var configs = app.configs
        return function(args) {
            var repsonse;
            var all_configs = configs.read("*", function(err, result) {
                response = {
                    status: 200,
                    content: JSON.stringify(result)
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
