exports.regex = /\/+connect\/?(.*)$/i;
exports.handler = function(match, server, req, res, next) {
    // if we have no auth handlers on the server, then return a 401
    if (server.listeners('auth').length === 0) {
        res.writeHead(401);
        res.end('Unable to authenticate user');
    }
    // otherwise, handle the auth event
    else {
        process.nextTick(function() {
            server.emit('auth', req, res, function(err, user) {
                if (err) {
                    res.writeHead(500, err.message);
                    return res.end(err.message);
                }

                // if we don't have a user return a 401 response
                if (! user) {
                    res.writeHead(401);
                    return res.end();
                }

                // TODO: generate an authentication session token for chat
                // TODO: ensure the main details for the user are present

                res.writeHead(200);
                res.end();
            });
        });
    }    
};