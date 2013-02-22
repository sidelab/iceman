var debug = require('debug')('ice-server'),
    path = require('path'),
    BinaryServer = require('binaryjs').BinaryServer,
    interactor = require('./interactor'),
    http = require('http'),
    createResponder = require('./responder');

/**
## start(opts, callback)
*/
module.exports = function(opts, callback) {
    var server, bs, sock;

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
    server = require(opts.https ? 'https' : 'http').createServer(createResponder(opts));

    // create the binaryjs server
    bs = new BinaryServer({ server: server });

    // handle connections
    bs.on('connection', function(client) {
        // create the interactor
        var iceClient = interactor(server, client, opts);
        debug('new client connected');

        client.on('stream', function(stream, meta) {
            debug('stream detected');
            stream.pipe(iceClient);
        });
    });

    // run the server
    server.listen(opts.port, callback);

    return server;
};