var assert = require('assert'),
    ice = require('../'),
    sjsc = require('sockjs-client'),
    startServer = require('../lib/server'),
    server;

describe('ICE connection tests', function() {
    before(function(done) {
        server = startServer(done);
    });

    after(function() {
        server.close();
    });

    it('should be able to connect to the ice server', function(done) {
        var client = sjsc.create('http://localhost:3090/ice');

        client.on('connection', function() {
            client.close();
            done();
        });
    });

    it('should be able to send messages to the ice server', function(done) {
        var client = sjsc.create('http://localhost:3090/ice');

        client.on('connection', function() {
            client.send(ice.text('hello'));
        });
    });
})