var debug = require('debug')('iceman-ws'),
    createClient = require('../create-client'),
    icy = require('icy'),
    ws = require('ws'),
    websocket = require('websocket-stream');

module.exports = function(server, opts) {
    var wss = new ws.Server({ server: server });

    wss.on('connection', function(socket) {
        debug('received websocket connection');
        var stream = websocket(socket),
            chatClient = createClient(server);

        // pipe into and out of the socket client
        stream
            .pipe(icy.upstream(chatClient))
            .pipe(chatClient)
            .pipe(icy.downstream(chatClient))
            .pipe(stream);
    });
};