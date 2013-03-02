var debug = require('debug')('iceman-connection'),
    errors = require('./errors'),
    IceResponse = require('./response'),
    iceEvent = require('./event'),
    Stream = require('stream'),
    util = require('util'),
    reSource = /^\d+/;

var IceConnection = module.exports = function(server) {
    Stream.call(this);

    // mark as writable and readable
    this.readable = true;
    this.writable = true;

    // initialise the connection id to 0
    this.id = 0;

    // save a reference to the server
    this.server = server;

    // initialise the token to undefined
    this.token = undefined;
    this.room = undefined;
};

util.inherits(IceConnection, Stream);

/**
## disconnect()
*/
IceConnection.prototype.disconnect = function() {
    var index = this.server.clients.indexOf(this),
        room = this.room;

    // remove the client from the server
    if (index >= 0) {
        this.server.clients.splice(index, 1);
    }

    if (room && room.stream) {
        // TODO: remove the user from the room 
        room.stream.emit('data', iceEvent('user.exit', this.id));
    }

    // emit the disconnect event
    debug('disconnected');
    // this.emit('disconnect');
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
    debug('received postauth message (id = ' + this.id + '): ' + message);
    this.room.stream.emit('data', (this.id || '') + message, this);

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
        token = message.slice(2),
        payload;

    // if the message type is not an authentication attempt, abort with an auth error
    debug('received preauth message: ' + message);
    if (msgType !== 'A') return callback(new errors.IceAuthError());

    // TODO: clean up previous connection information

    // look up the authentication token
    this.server.storage.findToken(token, function(err, tokenData, room) {
        if (err) return callback(err);

        // if we have no room for the token, then complain
        if (! room) return callback(new Error('No room information contained in the room token'));

        // update the token data
        connection.token = tokenData;
        connection.room = room;

        // increment the room clientcounter
        connection.id = (room.counter = (room.counter || 0) + 1);
        debug('assigned id: ' + connection.id + ' to connection');

        // pipe the output to the connection
        room.stream.pipe(connection);
        room.stream.emit('data', iceEvent('user.enter', connection.id, room.users[token].nick));

        // send the ok response
        callback(null, new IceResponse(200, connection.id));
    });
};

/**
## write(data)
*/
IceConnection.prototype.write = function(data) {
    var match = reSource.exec(data),
        sourceId = match && parseInt(match[0], 10);

    if (sourceId !== this.id) {
        this.emit('data', data);
    }
};