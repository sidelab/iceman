var debug = require('debug')('iceman-connection'),
    errors = require('./errors'),
    IceResponse = require('./response'),
    Stream = require('stream'),
    util = require('util');

var IceConnection = module.exports = function(server) {
    Stream.call(this);

    // save a reference to the server
    this.server = server;

    // initialise the token to undefined
    this.token = undefined;
};

util.inherits(IceConnection, Stream);

/**
## disconnect()
*/
IceConnection.prototype.disconnect = function() {
    var index = this.server.clients.indexOf(this);

    // remove the client from the server
    if (index >= 0) {
        this.server.clients.splice(index, 1);
    }

    // emit the disconnect event
    debug('disconnected');
    this.emit('disconnect');
};

/**
## messagePostAuth(message, callback)
*/
IceConnection.prototype.messagePostAuth = function(message, callback) {
    var connection = this,
        msgType = (message.slice(0, 1) || '').toUpperCase(),
        payload;

    // if we don't have a token then trigger an auth error
    if (! this.token) return callback(new errors.IceAuthError());

    // send the message to the room
    debug('received postauth message: ' + message);

    // TODO: do something with the message
    callback(null, new IceResponse(200));
};

/**
## messagePreAuth(message, callback)

This the preAuth message handler which is invoked when a message is received when the
socket connection has not yet been authenticated.
*/
IceConnection.prototype.messagePreAuth = function(message, callback) {
    var connection = this,
        msgType = (message.slice(0, 1) || '').toUpperCase(),
        payload;

    // if the message type is not an authentication attempt, abort with an auth error
    debug('received preauth message: ' + message);
    if (msgType !== 'A') return callback(new errors.IceAuthError());

    // look up the authentication token
    this.server.storage.findToken(message.slice(2), function(err, tokenData) {
        if (err) return callback(err);

        // update the token data
        connection.token = tokenData;       
        callback(null, new IceResponse(200));
    });
};