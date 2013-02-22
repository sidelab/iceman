var assert = require('assert'),
    ice = require('../'),
    msgpack = require('msgpack-js'),
    uuid = require('uuid'),
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

    it('should be able to authenticate with the ice server', function(done) {
        var client = sjsc.create('http://localhost:3090/ice');

        server.on('authenticate', function(interactor, session) {
            // TODO: assert session looks good

            // let the interactor now it is ok to go
            interactor.authenticate();
        });

        client.on('connection', function() {
            client.write(ice.session(uuid.v4()));
        });

        /*
        client.on('data', function(message) {
            message = msgpack.decode(new Buffer(message, 'base64'));

            assert(message);
            assert(typeof message == 'object');

            client.close();
            done();
        });
        */
    });
})