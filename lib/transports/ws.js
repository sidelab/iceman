var debug = require('debug')('iceman-ws'),
    createClient = require('../create-client'),
    ws = require('ws'),
    websocket = require('websocket-stream'),
    reTokenRequest = /t\/(.*)$/;

module.exports = function(server, opts) {
    var wss = new ws.Server({ server: server });

    wss.on('connection', function(socket) {
        var url = socket && socket.upgradeReq ? socket.upgradeReq.url : '',
            match = reTokenRequest.exec(url),
            tokenData = match ? server.tokens[match[1]] : null,
            stream;

        debug('received websocket connection on url: ' + url);
        if (! tokenData) return socket.close();

        // create the stream for the room
        stream = tokenData.room.createStream();
        debug('found valid token, creating socket stream and connecting room');

        // wire up the socket
        stream.pipe(websocket(socket)).pipe(stream);
    });
};