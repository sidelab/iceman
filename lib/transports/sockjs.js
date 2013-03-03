var debug = require('debug')('iceman-sockjs'),
    icy = require('icy'),
    sockjs = require('sockjs'),
    util = require('util');

module.exports = function(server, opts) {
    var socketServer = sockjs.createServer();

    // handle connection events
    socketServer.on('connection', function(conn) {
        // create a new client representation
        var client = conn.pipe(icy.client());

        // intercept join events
        client.on('join', function(targetRoom) {
            if (! server.rooms[targetRoom]) {
                // TODO: log missing room events
                return;
            }

            // find the room in the server
            server.rooms[targetRoom].addClient(client);
        });
    });

    socketServer.installHandlers(server, { prefix: '/room' });
};