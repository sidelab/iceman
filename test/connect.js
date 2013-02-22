var assert = require('assert'),
    ice = require('../'),
    msgpack = require('msgpack-js'),
    uuid = require('uuid'),
    BinaryClient = require('binaryjs').BinaryClient,
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
        var client = new BinaryClient('ws://localhost:3090');

        client.on('open', function() {
            client.close();
            done();
        });
    });

    it('should be able to authenticate with the ice server', function(done) {
        var client = new BinaryClient('ws://localhost:3090'),
            testId = uuid.v4();

        server.on('auth', function(interactor, data) {
            assert(data);
            assert.equal(data.uuid, testId);

            // provide the interactor an identity
            interactor.identify('Fred');
        });

        client.on('open', function() {
            client.send(ice.session(testId));
        });

        client.on('stream', function(stream, meta) {
            stream.on('data', function(data) {
                var user = msgpack.decode(data);

                assert.equal(user.nick, 'Fred');
            });

            stream.on('end', done);
        });
    });
})