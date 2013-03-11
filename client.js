var debug = require('debug')('iceman-client'),
    EventEmitter = require('events').EventEmitter,
    chat = require('chat'),
    http = require('http'),
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

    // initailise the chat client
    this.chat = null;

    // initialise the host and port
    this.host = opts.hostname || opts.host;
    this.port = opts.port;

    // allow the client to specify a socket creator method
    this.createSocket = opts.createSocket;
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
        }),
        socketUrl;

    this.request(requestOpts, function(err, res, body) {
        if (err) return client.emit('error', err);

        // if we have a token, then kick into phase two
        if (body && body.token) {
            // save the token
            client.token = body.token;

            // initialise the socket url
            socketUrl = 'ws://' + client.host + ':' + client.port + '/t/' + (client.token || '');

            // check for websocket support
            if (typeof client.createSocket == 'function') {
                client._wsConnect(client.createSocket(socketUrl));
            }
            if (typeof WebSocket != 'undefined') {
                client._wsConnect(socketUrl);
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
## write(data)
*/
IceManClient.prototype.write = function(data) {
    if (! this.chat) return;

    this.chat.write(data);
};

/**
## _wsConnect
*/
IceManClient.prototype._wsConnect = function(socket) {
    var client = this,
        stream = wsstream(socket);

    stream.ws.onopen = function() {
        debug('websocket connection opened, creating client');

        // create the client
        client.chat = chat.client(stream, { token: client.token });
        client.chat.on('ready', client.emit.bind(client, 'ready'));
        client.chat.on('data', client.emit.bind(client, 'data'));
    };
};
