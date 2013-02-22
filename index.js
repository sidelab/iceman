var uuid = require('uuid'),
    client = require('./lib/client'),
    msgpack = require('msgpack-js'),
    _ = require('lodash');


_.extend(exports, require('./lib/messaging'));

exports.connect = function(host) {
    return client(host);
};