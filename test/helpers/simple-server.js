var iceman = require('../../'),
    randomName = require('random-name'),
    http = require('http');

module.exports = function(callback) {
    var ice = iceman(http.createServer());

    // add authentication helper
    ice.on('auth', function(req, res, callback) {
        callback(null, {
            nick: randomName().replace(/\s/g, '')
        });
    });

    // sart the server
    ice.server.listen(3090, callback);

    return ice;
};