var debug = require('debug')('iceman-binaryjs'),
    BinaryServer = require('binaryjs').BinaryServer;

module.exports = function(server, opts) {
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
};