var debug = require('debug')('iceman-sockjs'),
    sockjs = require('sockjs');

module.exports = function(server, opts) {
    var socketServer = sockjs.createServer();

    socketServer.on('connection', function(conn) {
    });

    socketServer.installHandlers(server, { prefix: '/room' });
};