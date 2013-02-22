var debug = require('debug')('ice-server'),
    http = require('http'),
    createResponder = require('./responder');

/**
## start(opts, callback)
*/
module.exports = function(opts, callback) {
    var server;

    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }

    // ensure we have opts
    opts = opts || {};

    // initialise the default port
    opts.port = opts.port || 3090;

    // create the server
    debug('initializing ice server on port: ' + opts.port);
    server = require(opts.https ? 'https' : 'http').createServer(createResponder(opts));

    // run the server
    server.listen(opts.port, callback);

    return server;
};