var Chat = require('chat'),
    debug = require('debug')('iceman-connect'),
    uuid = require('uuid');

function createRoom() {
    var room = new Chat();

    debug('created room');

    room.users.on('add', function() {
        debug('received user update', arguments);
    });

    room.messages.on('add', function() {
        debug('received message update', arguments);
    });

    return room;
}

exports.regex = /\/+connect\/?(.*)$/i;
exports.handler = function(match, server, req, res, next) {
    var roomId = match[1];

    debug('attempting to connect to room: ' + roomId);

    // if we have no auth handlers on the server, then return a 401
    if (server.listeners('auth').length === 0) {
        debug('no auth event handlers, unable to authenticate');
        res.writeHead(401);
        res.end('Unable to authenticate user');
    }
    // otherwise, handle the auth event
    else {
        process.nextTick(function() {
            debug('triggering auth event');
            server.emit('auth', req, res, function(err, user) {
                var token;

                if (err) {
                    debug('encountered error during authentication, 500 response provided', err);
                    res.writeHead(500, err.message);
                    return res.end(err.message);
                }

                // if we don't have a user return a 401 response
                if (! user) {
                    debug('no user provided for auth response, authentication failed');
                    res.writeHead(401);
                    return res.end();
                }

                // ensure the room is created
                server.rooms[roomId] = server.rooms[roomId] || createRoom();

                // save the token in the server tokens lookup
                server.tokens[token = uuid.v4()] = {
                    room: roomId,
                    user: user
                };

                res.writeHead(200, {
                    'content-type': 'application/json',
                    'access-control-allow-origin': '*'
                });

                res.end(JSON.stringify({ token: token, user: user }));
            });
        });
    }    
};