var BinaryClient = require('binaryjs').BinaryClient,
    messaging = require('./messaging'),
    util = require('util');

function InteractionClient(host) {
    BinaryClient.call(this, host);
}

util.inherits(InteractionClient, BinaryClient);

InteractionClient.prototype.authenticate = function(opts) {
    // ensure we have opts
    opts = opts || {};

    // if we have a session, then send a session
    if (opts.session) {
        this.send(messaging.session(opts.session));
    }
};

module.exports = function(host) {
    return new InteractionClient(host);
};