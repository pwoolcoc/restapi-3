/*
 * Simple little test runner, to run some http requests against the API endpoints.
 * These do require a server running at 127.0.0.1:8080 (the default)
 */
var http = require('http'),
    assert = require('assert'),
    fs = require('fs');

var HOST = "127.0.0.1",
    PORT = 8080,
    PATH = "/session";

var tests = {
    login_postbody: function(pass, fail) {
        var postbody = JSON.stringify({
            username: "Paul",
            password: "passw0rd"
        });

        var options = {
            hostname: HOST,
            port: PORT,
            path: PATH,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": postbody.length
            }
        };

        var req = http.request(options, function(res) {
            var res_body = "",
                status = res.statusCode;
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                res_body += chunk;
            });

            res.on('end', function() {
                var content = JSON.parse(res_body);

                try {
                    assert.equal(status, 200, "Status is 200");
                    assert.notEqual(typeof content, 'undefined', "Make sure `content` exists");
                    assert.notEqual(typeof content.token, 'undefined', "Make sure `content.token` exists");
                    assert.ok(content.token.length > 0, 'Make sure our token is "something"');
                } catch(e) {
                    fail(e);
                    return;
                }

                pass();
                return;
            });
        });

        req.write(postbody);
        req.end();
    },
    login_headers: function(pass, fail) {
        var options = {
            hostname: HOST,
            port: PORT,
            path: PATH,
            method: "POST",
            headers: {
                "Authorization": "UGF1bDpwYXNzdzByZA=="
            }
        };

        var req = http.request(options, function(res) {
            var res_body = "",
                status = res.statusCode;
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                res_body += chunk;
            });
            res.on('end', function() {
                try {
                    var content = JSON.parse(res_body);
                    assert.equal(status, 200, "Status is 200");
                    assert.notEqual(typeof content, 'undefined', "Make sure `content` exists");
                    assert.notEqual(typeof content.token, 'undefined', "Make sure `content.token` exists");
                    assert.ok(content.token.length > 0, 'Make sure our token is "something"');
                } catch(e) {
                    fail(e);
                    return;
                }

                pass();
                return;
            });
        });

        req.end();
    },
    logout: function(pass, fail) {
        var options = {
            hostname: HOST,
            port: PORT,
            path: PATH ,
            method: "POST",
            headers: {
                "Authorization": new Buffer("Paul:passw0rd").toString('base64')
            }
        };

        var req = http.request(options, function(res) {
            var res_body = "",
                status = res.statusCode;
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                res_body += chunk;
            });
            res.on('end', function() {
                var content = JSON.parse(res_body),
                    token = content.token,
                    path = PATH + "/Paul";  /* /session/Paul */

                var del_options = {
                    hostname: HOST,
                    port: PORT,
                    path: path,
                    method: "DELETE",
                    headers: {
                        "Authorization": token,
                        "Content-Type": "application/json",
                    }
                };

                var del_req = http.request(del_options, function(res) {
                    try {
                        assert.equal(res.statusCode, 200, "Make sure request was successful")
                    } catch(e) {
                        fail(e);
                        return;
                    }
                    pass();
                });

                del_req.end();

            });
        });

        req.end();
    }
};

Object.keys(tests).forEach(function(test_name) {
    /* Asynchronous tests, because why not? */
    setTimeout(function() {
        var fn = tests[test_name];

        fn(create_pass_fn(test_name),
           create_fail_fn(test_name));
    }, 0);
});

function create_pass_fn(test_name) {
    return function() {
        console.log("Passed test", test_name);
    }
}

function create_fail_fn(test_name) {
    return function(e) {
        console.error("Failed test", test_name);
        console.error(test_name, "Error was", e);
    }
}
