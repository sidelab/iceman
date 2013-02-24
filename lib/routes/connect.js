exports.regex = /\/+connect\/?(.*)$/i;
exports.handler = function(server, req, res, next) {
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
                    res.end(err.message);
                }
                else if (user) {
                    // TODO: generate an authentication session token for chat
                    res.writeHead(200);
                    res.end();
                }
            });
        });
    }    
};