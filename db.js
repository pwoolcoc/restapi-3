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
DB.prototype.read = function(crit, fn) {
    var self = this;
    if (!self.loaded) {
        self.events.once('loaded', function() {
            self.read(crit, fn);
        });
    }

    var results = [];

    self.rows.forEach(function(row, idx) {
        var match = [];
        Object.keys(crit).forEach(function(key) {
            match.push(row[key] === crit[key]);
        });
        if (match.reduce(function(accum, el) { return accum && el; }, true)) {
            results.push(row);
        }
    });

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
};

DB.prototype.delete = function(crit) {
};

module.exports = DB;
