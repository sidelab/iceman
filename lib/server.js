var debug = require('debug')('ice-server'),
    path = require('path'),
    ecstatic = require('ecstatic')(path.resolve(__dirname, 'static')),
    http = require('http'),
    createResponder = require('./responder'),
    shoe = require('shoe');

/**
## start(opts, callback)
*/
module.exports = function(opts, callback) {
    var server, sock;

    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }

    // ensure we have opts
    opts = opts || {};

    // initialise the default port
    opts.port = opts.port || 3090;
    opts.path = opts.path || '/ice';

    // create the server
    debug('initializing ice server on port: ' + opts.port);
    server = require(opts.https ? 'https' : 'http').createServer(ecstatic);

    // create the socket handler
    sock = shoe(function(stream) {
        debug('client connected');
    });

    // install the socket into the server
    debug('installing ice listener on path: ' + opts.path)
    sock.install(server, opts.path);

    // run the server
    server.listen(opts.port, callback);

    return server;
};