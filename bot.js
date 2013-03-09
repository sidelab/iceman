var client = require('./client'),
    WebSocket = require('ws'),
    url = require('url');

module.exports = function(opts) {
    // check if the opts is a string
    // if opts is a string
    if (typeof opts == 'string' || (opts instanceof String)) {
        opts = url.parse(opts);
    }

    // ensure we have opts
    opts = opts || {};

    // extend the opts with the websocket creator
    opts.createSocket = opts.createSocket || function(url) {
        return new WebSocket(url);
    };

    // create the client
    return client(opts);
};