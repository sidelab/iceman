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

        debug('found valid token, creating socket stream and connecting room');
        stream = websocket(socket);

        stream.pipe(tokenData.room.createStream()).pipe(stream);

        // pipe the 
    });
};