var http = require("http"),
    url = require("url");

module.exports = (function() {
    function Server(opts) {
        if (typeof opts === "undefined") {
            opts = {};
        }
        this.port = opts.hasOwnProperty("port") ? opts.port : 8080;
        this._debug = opts.hasOwnProperty("debug") ? opts.debug : false;
        this.routes = {};
    }

    Server.prototype.route = function(method, _path, fn, opts) {
        /* better alternatives to typeof check? */
        var path_regex, path;
        if (typeof _path === "string") {
            path_regex = new RegExp("^" + _path + "$");
            path = _path;
        } else {
            path_regex = _path;
            path = _path.toString();
        }
        method = method.toUpperCase();
        if (typeof this.routes[path] === "undefined") {
            this.routes[path] = {};
        }
        this.routes[path][method] = fn;
        this.routes[path].regex = path_regex;
    };

    Server.prototype.get = function() {
        var args = [].slice.call(arguments, 0);
        return this.route.apply(this, ["GET"].concat(args));
    };

    Server.prototype.post = function() {
        var args = [].slice.call(arguments, 0);
        return this.route.apply(this, ["POST"].concat(args));
    };

    /* the router could be much, much smarter... */
    Server.prototype.router = function(req, res) {
        var uri = url.parse(req.url, true),  /* `true` makes it also parse the querystring into an object */
            method = req.method.toUpperCase(),
            headers = req.headers;

        /* First, try to find a match for the route */
        var handler_pair = firstmatch(uri.pathname, this.routes);
        if (typeof handler_pair === "undefined") {
            return error(res, 404, "404 Not Found");
        }

        var routes = handler_pair[0],
            match = handler_pair[1];

        /* If we can't perform the requested verb on that path, return 405 */
        if (typeof routes[method] === "undefined") {
            return error(res, 405, "405 Method Not Allowed");
        }

        var handler = routes[method],
            captures = match.slice(1),
            params = uri.querystring;

        /* Now we have a handler, run it */
        var result = handler({
                params: params,
                captures: captures,
                headers: headers
        });

        /* Oops, something went wrong... */
        if (typeof result === "undefined") {
            return error(res, 500, "500 Server Error");
        }

        var status = 404,
            headers = {
                "Content-Type": "text/html",
            },
            content,
            content_length;

        if (typeof result === "string") {
            content = result;
            content_length = result.length;
            status = 200;
        } else if (Array.isArray(result)) {
            status = result[0];
            content = result[1];
            content_length = content.length;
            headers = merge(headers, result[2]);
        } else { /* assume object */
            status = result.status;
            content = result.content;
            content_length = content.length;
            headers = merge(headers, result.headers);
        }

        if (typeof headers["Content-Length"] === "undefined") {
            headers["Content-Length"] = content_length;
        }

        res.writeHead(status, headers);
        res.write(content);
        res.end();
    };

    Server.prototype.serve = function(opts) {
        opts = (typeof opts === "undefined") ? {} : opts;
        if (opts.debug) {
            this._debug = true;
        }
        this.debug("Serving HTTP on port", this.port);
        return http.createServer(this.router.bind(this))
                   .listen(this.port);
    }

    Server.prototype.debug = function() {
        if (this._debug) {
            console.log.apply(null, [].slice.call(arguments, 0));
        }
    };

    function firstmatch(needle, haystack) {
        for (var k in haystack) {
            if (k === needle) {
                var m = haystack[k];
                return [m, [m]];
            }
        }
        /* Nothing, fallback to regex matching */
        for (var l in haystack) {
            var r = haystack[l].regex;
            if (r.test(needle)) {
                var v = haystack[l];
                return [v, r.exec(needle)];
            }
        }
    }

    /* Merge obj2 into obj1 */
    function merge(obj1, obj2) {
        for (var k in obj2) {
            if (obj2.hasOwnProperty(k)) {
                obj1[k] = obj2[k];
            }
        }
        return obj1;
    }

    function error(res, status, message) {
        res.writeHead(status, { "Content-Type": "text/plain" });
        res.write(message + "\n");
        res.end();
    }

    return Server;
})();
