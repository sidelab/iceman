var assert = require('assert'),
    async = require('async'),
    request = require('supertest'),
    simpleServer = require('./helpers/simple-server'),
    createClient = require('./helpers/create-client'),
    app = 'http://localhost:3090',
    uuid = require('uuid'),
    _ = require('lodash'),
    roomId = uuid.v4(),
    clients = [],
    server;

describe('id allocation', function() {
    before(function(done) {
        server = simpleServer(done);
    });

    after(function() {
        // close any open clients
        clients.forEach(function(client) {
            client.close();
        });

        server.close();
    });

    it('should allocate id 0 to the first client', function(done) {
        createClient(roomId, function(err, client) {
            assert.ifError(err);
            clients.push(client);
            assert.equal(client.id, 0);
            done();
        });
    });

    it('should allocate id 1 to the second client', function(done) {
        createClient(roomId, function(err, client) {
            assert.ifError(err);
            clients.push(client);
            assert.equal(client.id, 1);
            done();
        });
    });

    it('should allocate id 2 to the third client', function(done) {
        createClient(roomId, function(err, client) {
            assert.ifError(err);
            clients.push(client);
            assert.equal(client.id, 2);
            done();
        });
    });

    it('should be able to close the 2nd client', function() {
        clients[1].close();
    });

    it('should reallocate id 1 to the fourth client', function(done) {
        createClient(roomId, function(err, client) {
            assert.ifError(err);
            clients.push(client);
            assert.equal(client.id, 1);
            done();
        });
    });

    it('should allocate id 3 to the fifth client', function(done) {
        createClient(roomId, function(err, client) {
            assert.ifError(err);
            clients.push(client);
            assert.equal(client.id, 3);
            done();
        });
    });    
});