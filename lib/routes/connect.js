var debug = require('debug')('iceman-connect');

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

                // generate the authentication token
                debug('authentication successful, generating token for user');
                server.storage.createToken(roomId, user, function(err, token) {
                    // TODO: handle errors
                    // TODO: ensure the main details for the user are present

                    res.writeHead(200, {
                        'content-type': 'application/json'
                    });

                    res.end(JSON.stringify({ token: token }));
                });
            });
        });
    }    
};