var EventEmitter = require('events').EventEmitter,
    Chat = require('chat'),
    http = require('http-browserify'),
    wsstream = require('websocket-stream'),
    url = require('url'),
    util = require('util'),
    _ = require('lodash');

module.exports = function(opts) {
    // create a new iceman client
    return new IceManClient(opts);
};

/* IceManClient */

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
        room,
        requestOpts = _.extend({}, opts, {
            method: 'POST',
            path:   '/connect/' + roomId
        });

    this.request(requestOpts, function(err, res, body) {
        if (err) return client.emit('error', err);

        // if we have a token, then kick into phase two
        if (body && body.token) {
            // create the chat instance
            room = client.room = new Chat();
            room.on('join', client.emit.bind(client, 'join'));
            room.on('message', client.emit.bind(client, 'message'));

            // save the token and user details
            client.token = body.token;
            client.user = body.user;

            // check for websocket support
            if (typeof WebSocket != 'undefined') {
                client._wsConnect();
            }
        }
    });

    return this;
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

/**
## send(data)
*/
IceManClient.prototype.send = function(data) {
    if (! this.room) return;

    this.room.send(data);
};

/**
## _wsConnect
*/
IceManClient.prototype._wsConnect = function() {
    var client = this,
        stream = wsstream('ws://' + this.host + ':' + this.port + '/t/' + (this.token || ''));

    stream.ws.onopen = function() {
        var roomStream = client.room.createStream();
        console.log('websocket connection opened');
        stream.pipe(roomStream).pipe(stream);

        roomStream.once('sync', function() {
            console.log('synced, identifying user');

            // identify ourselves to the chat instance
            client.room.identify(client.token, client.user);
        });
    };
};
