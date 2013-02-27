var assert = require('assert'),
    async = require('async'),
    request = require('supertest'),
    simpleServer = require('./helpers/simple-server'),
    createClient = require('./helpers/create-client'),
    app = 'http://localhost:3090',
    uuid = require('uuid'),
    roomId = uuid.v4(),
    roomToken,
    clients,
    server;

describe('iceman connection handshake', function() {
    before(function(done) {
        server = simpleServer(function(err) {
            if (err) return done(err);

            // create two clients
            async.times(2, createClient.bind(null, roomId), function(err, results) {
                clients = results || [];
                done(err);
            });
        });
    });

    after(function() {
        server.close();
    });

    it('should be able to send a message from client 1', function(done) {
        server.getRoom(roomId).once('message', function(msg, client) {
            assert.equal(msg, 'T:hi from 1');
            assert.equal(client, clients[0]);
            done();
        });

        clients[0].write('T:hi from 1');
    });

    it('should be able to send a message from client 2', function(done) {
        server.getRoom(roomId).once('message', function(msg, client) {
            assert.equal(msg, 'T:hi from 2');
            assert.equal(client, clients[1]);
        });

        clients[1].write('T:hi from 2');
    });
});