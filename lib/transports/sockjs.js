var IceConnection = require('../connection'),
    debug = require('debug')('iceman-sockjs'),
    IceError = require('../errors').IceError,
    sockjs = require('sockjs'),
    util = require('util');

module.exports = function(server, opts) {
    var socketServer = sockjs.createServer();

    // handle connection events
    socketServer.on('connection', function(conn) {
        server.clients.push(new SockJSConnection(server, conn));
    });

    socketServer.installHandlers(server, { prefix: '/room' });
};

/* SockJSConnection */

function SockJSConnection(server, connection) {
    var client = this;

    // call the inherited constructor
    IceConnection.call(this, server);

    // handle data
    connection.on('data', function(message) {
        var handler = client.token ? client.messagePostAuth : client.messagePreAuth;

        // call the message handler
        handler.call(client, message, function(err, response) {
            if (err instanceof IceError) {
                return connection.write(err.toResponse());
            }
            else if (response) {
                connection.write(response);
            }
        });
    });

    connection.on('close', this.disconnect.bind(this));
}

util.inherits(SockJSConnection, IceConnection);