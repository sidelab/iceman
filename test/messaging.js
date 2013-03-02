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

    after(function() {
        clients.forEach(function(client) {
            client.close();
        });
        
        server.close();
    });

    it('should be able to send a message from client 1', function(done) {
        server.getRoom(roomId).stream.once('data', function(msg, client) {
            assert.equal(getClientId(msg), client.id, 'Message id does not match client');

            done();
        });

        clients[0].write('T:hi');
    });

    it('should be able to send a message from client 2', function(done) {
        server.getRoom(roomId).stream.once('data', function(msg, client) {
            assert.equal(getClientId(msg), client.id, 'Message id does not match client');

            done();
        });

        clients[1].write('T:hi');
    });

    it('should be able to send a message from client 1 to client 2', function(done) {
        clients[1].on('data', function handleData(msg) {
            console.log(msg);
            if (reSayHi.test(msg)) {
                clients[1].removeListener('data', handleData);
                done();
            }
        });

        clients[0].write('T:hi');
    });

    it('should be able to send a message from client 2 to client 1', function(done) {
        clients[0].on('data', function handleData(msg) {
            console.log(msg);
            if (reSayHi.test(msg)) {
                clients[1].removeListener('data', handleData);
                done();
            }
        });

        clients[1].write('T:hi');
    });
});