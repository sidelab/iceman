var EventEmitter = require('events').EventEmitter,
    Chat = require('chat'),
    http = require('http-browserify'),
    url = require('url'),
    util = require('util'),
    _ = require('lodash');

function IceManClient(opts) {
    EventEmitter.call(this);

    // check if the opts is a string
    // if opts is a string
    if (typeof opts == 'string' || (opts instanceof String)) {
        opts = url.parse(opts);
    }

    // initialise the host and port
    this.host = opts.hostname || opts.host;
    this.port = opts.port;
}

util.inherits(IceManClient, EventEmitter);

/**
## join(roomId)
*/
IceManClient.prototype.join = function(roomId, opts) {
    var client = this,
        requestOpts = _.extend({}, opts, {
            method: 'POST',
            path:   '/connect/' + roomId
        });

    this.request(requestOpts, function(err, res, body) {
        console.log(body);
    });
};

/**
## request(opts, callback)
*/
IceManClient.prototype.request = function(opts, callback) {
    var client = this,
        lines = [],
        req;

    // add the host and port to the opts
    opts = _.extend({
        host: this.host,
        port: this.port
    }, opts);

    http.request(opts, function(res) {
        res.on('data', function(line) {
            lines[lines.length] = line;
        });

        res.on('end', function() {
            var data = lines.join('');

            console.log(res);

            try {
                data = JSON.parse(data);
            }
            catch (e) {
            }

            // trigger the callback
            callback(null, res, data);
        });
    }).end();
};

module.exports = function(opts) {
    // create a new iceman client
    return new IceManClient(opts);
};

