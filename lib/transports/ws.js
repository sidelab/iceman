var debug = require('debug')('iceman-ws'),
    createClient = require('../create-client'),
    ws = require('ws'),
    websocket = require('websocket-stream');

module.exports = function(server, opts) {
    var wss = new ws.Server({ server: server });

    wss.on('connection', function(socket) {
        debug('received websocket connection');
    });
};