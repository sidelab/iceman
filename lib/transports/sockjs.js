var IceConnection = require('../connection'),
    debug = require('debug')('iceman-sockjs'),
    IceError = require('../errors').IceError,
    sockjs = require('sockjs'),
    util = require('util');

module.exports = function(server, opts) {
    var socketServer = sockjs.createServer();

    // handle connection events
    socketServer.on('connection', function(conn) {
        new SockJSConnection(server, conn);
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

    // pipe messages from the connection back to the sockjs connection
    this.pipe(connection);

    // pipe data from the client to the connection
    connection.on('close', this.disconnect.bind(this));

    // handle errors
    connection.on('error', function(err) {
        debug('captured error: ', err);
        client.emit('error', err);
    });
}

util.inherits(SockJSConnection, IceConnection);