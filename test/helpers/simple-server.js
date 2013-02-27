var iceman = require('../../'),
    randomName = require('random-name'),
    server;

module.exports = function(callback) {
    // create the server
    server = iceman(callback);

    // add authentication helper
    server.on('auth', function(req, res, callback) {
        callback(null, {
            nick: randomName().replace(/\s/g, '')
        });
    });

    return server;
};