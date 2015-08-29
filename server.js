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

    Server.prototype.redirect = function(uri, permanent) {
        if (typeof permanent === "undefined") {
            permanent = false;
        }
        return {
            status: permanent ? 301 : 302,
            message: "",
            headers: { "Location": uri }
        }
    };

    Server.prototype.error = function(status, message) {
        return {
            status: status,
            message: message + "\n",
            headers: { "Content-Type": "text/plain" }
        };
    }

    Server.prototype.add_route = function(method, _path, fn, opts) {
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
            this.routes[path] = {"OPTIONS": function() {}};
        }
        this.routes[path][method] = fn;
        this.routes[path].regex = path_regex;
        this.routes[path]["OPTIONS"] = create_options_endpoint(Object.keys(this.routes[path])||[]);
    };

    Server.prototype.get = function() {
        var args = [].slice.call(arguments, 0);
        return this.add_route.apply(this, ["GET"].concat(args));
    };

    Server.prototype.put = function() {
        var args = [].slice.call(arguments, 0);
        return this.add_route.apply(this, ["PUT"].concat(args));
    };

    Server.prototype.delete = function() {
        var args = [].slice.call(arguments, 0);
        return this.add_route.apply(this, ["DELETE"].concat(args));
    };

    Server.prototype.post = function() {
        var args = [].slice.call(arguments, 0);
        return this.add_route.apply(this, ["POST"].concat(args));
    };

    /* the router could be much, much smarter... */
    Server.prototype.router = function(req, res) {
        var self = this,
            uri = url.parse(req.url, true),  /* `true` makes it also parse the querystring into an object */
            method = req.method.toUpperCase(),
            headers = req.headers;

        self.debug(method, uri.pathname);

        headers = fixup_headers(headers);

        /* First, try to find a match for the route */
        var handler_pair = firstmatch(uri.pathname, self.routes);
        if (typeof handler_pair === "undefined") {
            self.debug("Couldn't find handler for", method, uri.pathname);
            self.debug("(no path", uri.pathname, "registered)");
            return self.process_return(res, self.error(404, "404 Not Found"));
        }

        var routes = handler_pair[0],
            match = handler_pair[1];

        /* If we can't perform the requested verb on that path, return 405 */
        if (typeof routes[method] === "undefined") {
            self.debug("Couldn't find handler for", method, uri.pathname);
            self.debug("(no handler for verb", method, "found)");
            return self.process_return(res, self.error(405, "405 Method Not Allowed"));
        }

        var handler = routes[method],
            captures = match.slice(1),
            params = uri.query || {},
            body = "";

        req.on('data', function(chunk) {
            body += chunk.toString();
        });

        req.on('end', function() {
            if (body && headers["content-type"] === "application/json") {
                body = JSON.parse(body);
            }

            /* Now we have a handler, run it */
            var result = handler({
                    params: params,
                    captures: captures,
                    headers: headers,
                    data: body,
                    _uri: uri,
                    _res: res
            });

            /* Oops, something went wrong... */
            if (typeof result === "undefined") {
                result = self.error(500, "500 Server Error");
            }

            return self.process_return(res, result);

        });
    };

    Server.prototype.process_return = function(res, obj) {
        var status = 404,
            headers = {
                "Content-Type": "text/html",
            },
            content,
            content_length;

        if (typeof obj === "string") {
            content = obj;
            content_length = obj.length;
            status = 200;
        } else if (Array.isArray(obj)) {
            status = obj[0];
            content = obj[1];
            content_length = content.length;
            headers = merge(headers, obj[2]);
        } else { /* assume object */
            status = obj.status;
            content = obj.content || "";
            content_length = content.length;
            headers = merge(headers, obj.headers);
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
    };

    Server.prototype.json_response = function(obj, headers) {
        if (typeof headers === "undefined") {
            headers = {};
        }

        var default_headers = {
            "Content-Type": "application/json"
        };

        if (typeof obj !== "string") {
            obj = JSON.stringify(obj);
        }

        return {
            status: 200,
            content: obj,
            headers: merge(default_headers, headers)
        };
    };

    Server.prototype.debug = function() {
        if (this._debug) {
            console.log.apply(null, [].slice.call(arguments, 0));
        }
    };

    function firstmatch(needle, haystack) {
        for (var k in haystack) {
            if (k === needle) {
                var m = haystack[k];
                return [m, [m]]; /* weird return value, to be compatible
                                  * with the value that gets returned from
                                  * the regex match below
                                  */
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

    /* For now, this just lowercases all the header names,
     * to make it easier to be sure we can get the right
     * values out of it
     */
    function fixup_headers(headers) {
        var newHeaders = {};
        Object.keys(headers).forEach(function(key) {
            newHeaders[key.toLowerCase()] = headers[key];
        });
        return newHeaders;
    }

    function create_options_endpoint(method_list) {
        var methods = method_list.filter(function(el) { return el !== "regex"; }).sort().join(",");
        return function() {
            return {
                status: 200,
                content: "",
                headers: {"Allow": methods}
            };
        };
    }

    return Server;
})();
