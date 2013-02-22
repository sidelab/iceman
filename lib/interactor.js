var ice = require('../'),
    debug = require('debug')('ice'),
    msgpack = require('msgpack-js'),
    Stream = require('stream'),
    util = require('util');

function Interactor(server, output, opts) {
    Stream.call(this);

    // initialise members
    this.server = server;
    this.output = output;
    this.opts = opts || {};    

    // initialise the readable and writable flags
    this.readable = true;
    this.writable = true;
}

util.inherits(Interactor, Stream);

/**
## authenticate
*/
Interactor.prototype.authenticate = function() {
    this.output.write(ice.ack('auth'));
};

/**
## write(data)
*/
Interactor.prototype.write = function(data) {
    var command;

    debug('received data "' + data + '", now decoding');

    // decode the data
    data = msgpack.decode(new Buffer(data, 'base64'));

    // if the data is an instance of buffer, then decode
    if (data instanceof Buffer) {
        debug('data was decoded as a buffer, parsing using ice');
        command = ice.decode(data);
        console.log(command);
    }
    else {
        this.emit('data', data);
    }
};

Interactor.prototype.end = function() {
    debug('stream ended');
};

module.exports = function(server, opts) {
    return new Interactor(server, opts);
};