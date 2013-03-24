var assert = require('assert'),
    async = require('async'),
    request = require('supertest'),
    simpleServer = require('./helpers/simple-server'),
    createClient = require('./helpers/create-client'),
    app = 'http://localhost:3090',
    uuid = require('uuid'),
    _ = require('lodash'),
    roomId = uuid.v4(),
    reLeadingDigit = /^(\d+)/,
    reSayHi = /^(\d+)T\:hi$/,
    roomToken,
    clients,
    server;

function getClientId(msg) {
    return reLeadingDigit.test(msg) && RegExp.$1;
}

describe('iceman messaging', function() {
    before(function(done) {
        server = simpleServer(function(err) {
            if (err) return done(err);

            // create two clients
            async.times(2, createClient.bind(null, roomId), function(err, results) {
                clients = [].concat(results);
                done(err);
            });
        });
    });

    after(function(done) {
        clients.forEach(function(client) {
            client.close();
        });
        
        server.close();
        process.nextTick(done);
    });

    it('should be able to send a message from client 1', function(done) {
        var room = server.rooms[roomId];

        room.once('message', function(msg) {
            assert.equal(msg.data, 'hi');
            assert.equal(msg.cid, clients[0].cid);

            done();
        });

        clients[0].write('hi');
    });

    it('should be able to send a message from client 2', function(done) {
        var room = server.rooms[roomId];

        room.once('message', function(msg) {
            assert.equal(msg.data, 'ho');
            assert.equal(msg.cid, clients[1].cid);

            done();
        });

        clients[1].write('ho');
    });

    it('should be able to send a message from client 1 to client 2', function(done) {
        clients[1].once('data', function(msg) {
            assert.equal(msg.data, 'hi');
            assert.equal(msg.cid, clients[0].cid);

            done();
        });

        clients[0].write('hi');
    });

    it('should be able to send a message from client 2 to client 1', function(done) {
        clients[0].on('data', function handleData(msg) {
            assert.equal(msg.data, 'ho');
            assert.equal(msg.cid, clients[1].cid);

            done();
        });

        clients[1].write('ho');
    });
});