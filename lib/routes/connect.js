var chat = require('chat'),
    debug = require('debug')('iceman-connect'),
    uuid = require('uuid'),
    _ = require('lodash');

exports.regex = /\/+connect\/?(.*)$/i;
exports.handler = function(match, req, res, next) {
    var roomId = match[1],
        ice = this;

    debug('attempting to connect to room: ' + roomId);

    // if we have no auth handlers on the server, then return a 401
    if (this.listeners('auth').length === 0) {
        debug('no auth event handlers, unable to authenticate');
        res.writeHead(401);
        res.end('Unable to authenticate user');
    }
    // otherwise, handle the auth event
    else {
        process.nextTick(function() {
            debug('triggering auth event');
            ice.emit('auth', req, res, function(err, user, permissions) {
                var token = uuid.v4(),
                    users;

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

                if (permissions) {
                    debug('received ' + permissions + ' permissions for user token: ' + token);
                }

                // save the token in the server tokens lookup
                debug('authentication successful for user, assigned token: ' + token);
                ice.tokens[token] = {
                    room: roomId,
                    user: user,
                    permissions: permissions
                };

                // ensure the room is created
                ice.rooms[roomId] = ice.rooms[roomId] || createRoom(ice);

                res.writeHead(200, {
                    'content-type': 'application/json',
                    'access-control-allow-origin': '*'
                });

                // extract the details of the currently connected users
                users = ice.rooms[roomId].connections._array.map(function(connection) {
                    return _.extend({ id: connection.id }, connection.state.user);
                });

                res.end(JSON.stringify({
                    token: token, 
                    user: user, 
                    permissions: permissions,
                    users: users
                }));
            });
        });
    }    
};

function createRoom(ice) {
    var room = chat.room();

    // handle authentication requests for a user
    room.on('authenticate', function(user, row) {
        var tokenData;

        debug('received authentication event');

        if (user.token) {
            tokenData = ice.tokens[user.token];

            // if we have token data, then authenticate the user
            if (tokenData) {
                debug('token resolved, updating user details (permissions: ' + tokenData.permissions + ')');

                row.set('user', tokenData.user);
                row.set('authenticated', true);

                // if we have permissions from the token data, then update
                if (typeof tokenData.permissions != 'undefined') {
                    row.set('permissions', tokenData.permissions);
                }
            }
        }
    });

    return room;
}