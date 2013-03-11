var debug = require('debug')('iceman-ws'),
    ws = require('ws'),
    websocket = require('websocket-stream'),
    reTokenRequest = /t\/(.*)$/;

module.exports = function(server, opts) {
    var wss = new ws.Server({ server: server }),
        room;

    wss.on('connection', function(socket) {
        var url = socket && socket.upgradeReq ? socket.upgradeReq.url : '',
            match = reTokenRequest.exec(url),
            tokenData = match ? server.tokens[match[1]] : null,
            connection,
            user;

        debug('received websocket connection on url: ' + url);
        if (! tokenData) return socket.close();
        
        debug('found valid token for room "' + tokenData.room + '", finding room');
        room = server.rooms[tokenData.room];

        // if we didn't have a room, then abort
        if (room) {
            debug('room found, connecting');
            connection = room.connect();

            // wire up the socket
            connection.pipe(websocket(socket)).pipe(connection);

            /*
            // handle stream closes
            stream.on('close', function() {
                user = room.users.get(match[1]);

                debug('stream closed removing user', user ? user.state.details : null);
                room.users.remove(user);

                // remove from the room history so the user is permanently forgotten
                // TODO: check with @dominictarr that this is ok to reduce network comms
                // room.hist[match[1]] = undefined;
            });
            */ 
        }

        // undefined the token in the server tokens array
        // server.tokens[match[1]] = undefined;
    });
};