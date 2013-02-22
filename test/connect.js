var ice = require('../'),
    startServer = require('../lib/server'),
    server;

describe('ICE connection tests', function() {
    before(function(done) {
        server = startServer(done);
    });

    after(function(done) {
        server.close(done);
    });

    it('should be able to connect to the ice server', function(done) {
        var client = ice('http://localhost:3090');

        client.on('data', function(data) {
            console.log(this, data);
        });

        client.on('error', done);
    });
})