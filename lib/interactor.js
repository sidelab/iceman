var ice = require('../'),
    debug = require('debug')('ice-interactor'),
    msgpack = require('msgpack-js'),
    messaging = require('./messaging'),
    Stream = require('stream'),
    util = require('util'),
    _ = require('lodash');

function Interactor(server, client, opts) {
    Stream.call(this);

    // initialise members
    this.server = server;
    this.client = client;
    this.opts = opts || {};    

    // initialise the readable and writable flags
    this.readable = true;
    this.writable = true;
}

util.inherits(Interactor, Stream);

/**
## authenticate
*/
Interactor.prototype.identify = function(user) {
    if (typeof user == 'string' || (user instanceof String)) {
        user = {
            nick: user
        };
    }

    debug('user identified: ', user);
    this.client.send(messaging.encode(user));
};

/**
## write(data)
*/
Interactor.prototype.write = function(data) {
    var command,
        interactor = this;

    debug('received data, now decoding');

    // decode the data
    data = msgpack.decode(data);

    // if the data is an instance of buffer, then decode
    if (data instanceof Buffer) {
        debug('data was decoded as a buffer, parsing using ice');
        command = ice.decode(data);
    }
    else if (typeof data == 'object') {
        if (data.session) {
            command = _.extend({ type: 'auth' }, data);
        }
    }
    else {
        this.emit('data', data);
    }

    if (command) {
        process.nextTick(function() {
            debug('emitting the ' + command.type + ' command on the server');
            interactor.server.emit(command.type, interactor, command);
        });
    }
};

Interactor.prototype.end = function() {
    debug('stream ended');
};

module.exports = function(server, opts) {
    return new Interactor(server, opts);
};