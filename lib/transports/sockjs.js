var IceClient = require('../client'),
    debug = require('debug')('iceman-sockjs'),
    IceError = require('../error').IceError,
    sockjs = require('sockjs'),
    util = require('util');

module.exports = function(server, opts) {
    var socketServer = sockjs.createServer();

    // handle connection events
    socketServer.on('connection', function(conn) {
        server.clients.push(new SockJSClient(server, conn));
    });

    socketServer.installHandlers(server, { prefix: '/room' });
};

/* SockJSClient */

function SockJSClient(server, connection) {
    var client = this;

    // call the inherited constructor
    IceClient.call(this, server);

    // handle data
    connection.on('data', function(message) {
        var handler = client.authenticated ? client.messagePostAuth : client.messagePreAuth;

        // call the message handler
        handler.call(client, message, function(err, response) {
            if (err instanceof IceError) {
                return connection.write(err.toResponse());
            }
        });
    });

    connection.on('close', this.disconnect.bind(this));
}

util.inherits(SockJSClient, IceClient);