var debug = require('debug')('iceman-client'),
    error = require('./error'),
    Stream = require('stream'),
    util = require('util');

var IceClient = module.exports = function(server) {
    Stream.call(this);

    // save a reference to the server
    this.server = server;

    // initialise the internal state
    this.authenticated = false;
};

util.inherits(IceClient, Stream);

/**
## disconnect()
*/
IceClient.prototype.disconnect = function() {
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
IceClient.prototype.messagePostAuth = function(message, callback) {

};

/**
## messagePreAuth(message, callback)

This the preAuth message handler which is invoked when a message is received when the
socket connection has not yet been authenticated.
*/
IceClient.prototype.messagePreAuth = function(message, callback) {
    var msgType = (message.slice(0, 1) || '').toUpperCase();
    debug('received preauth message: ' + message);

    // if the message type is not an authentication attempt, abort with an auth error
    if (msgType !== 'A') return callback(new error.IceAuthError());

};