var fs = require('fs'),
    events = require('events');

function DB(fname) {
    var self = this;
    self.rows = [];
    self.loaded = false;
    self.events = new events.EventEmitter;

    fs.readFile(fname, function(err, data) {
        if (err) throw err;
        self.rows = JSON.parse(data);
        self.loaded = true;
        self.events.emit("loaded");
    });
};

/* DB().read - get some rows out of the database
 *
 * crit is an object of name: value pairs that
 * should match the names & values of some
 * entries in the database.
 *
 * fn is a callback function that takes arguments
 * (err, results).
 */
DB.prototype.read = function(crit, opts_or_fn, _fn) {
    var self = this;
    if (!self.loaded) {
        self.events.once('loaded', function() {
            self.read(crit, opts_or_fn, _fn);
        });
    }

    var opts, fn;
    if (typeof opts_or_fn === "function") {
        opts = {};
        fn = opts_or_fn;
    } else {
        opts = opts_or_fn;
        fn = _fn;
    }

    var results = [];

    /* Special "get all" handling */
    if (typeof crit === "string" && crit === "*") {
        results = self.rows;
    } else {
        self.rows.forEach(function(row, idx) {
            if (self.matches(crit, row)) {
                results.push(row);
            }
        });
    }

    if (typeof opts.sort !== "undefined") {
        var sort = opts.sort,
            dir = (typeof opts.dir !== "undefined" ? opts.dir : "asc"),
            mult;

        results = results.filter(function(el) { return el.hasOwnProperty(sort); });

        if (dir === "asc") {
            mult = 1;
        } else if (dir === "desc") {
            mult = -1;
        } else {
            throw "Unknown sort direction";
        }

        results = results.sort(function(_a, _b) {
            var a = _a[sort],
                b = _b[sort];
            if (a < b) {
                return -1 * mult;
            } else if (a > b) {
                return 1 * mult;
            }
            return 0;
        });
    }

    if (typeof opts.page !== "undefined") {
        var page = parseInt(opts.page),
            num = parseInt((typeof opts.num !== "undefined" ? opts.num : "10"));

        var start = (page - 1) * num,
            end = start + num;

        results = results.slice(start, end);
    }

    /* not actually catching any errors at this point */
    return fn(null, results);
};

/* DB().create - insert some data into the database
 *
 * row is just an object of name: value pairs, and will
 * be pushed onto the database
 */
DB.prototype.create = function(row) {
    var self = this;
    if (!self.loaded) {
        self.events.once('loaded', function() {
            self.create(row);
        });
    }

    return self.rows.push(row);
};

DB.prototype.update = function(crit, row) {
    var self = this;
    if(self.delete(crit)) {
        self.create(row);
        return true;
    } else {
        return false;
    }
};

DB.prototype.delete = function(crit) {
    var self = this,
        new_rows = [];
    self.rows.forEach(function(row, idx) {
        if (!self.matches(crit, row)) {
            new_rows.push(row);
        }
    });

    var changed = new_rows.length !== self.rows.length;

    self.rows = new_rows;

    return changed;
};

DB.prototype.matches = function(crit, row) {
    var match = [];
    Object.keys(crit).forEach(function(key) {
        match.push(row[key] === crit[key]);
    });
    return match.reduce(function(accum, el) { return accum && el; }, true)
}

module.exports = DB;
