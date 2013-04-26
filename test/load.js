var assert = require('assert'),
    async = require('async'),
    http = require('http'),
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
    clients = [],
    server;

describe('simple load tests', function() {
    before(function(done) {
        http.globalAgent.maxSockets = 200;
        server = simpleServer(done);
    });

    after(function(done) {
        clients.forEach(function(client) {
            client.close();
        });
        
        server.close();
        process.nextTick(done);
    });

    it('should be able to create 100 clients and connect them to the server', function(done) {
        // create two clients
        async.times(100, createClient.bind(null, roomId), function(err, results) {
            clients = _.sortBy([].concat(results), 'cid');

            // check the client ids
            clients.forEach(function(client, index) {
                assert(client.cid);
            });

            done(err);
        });
    });
});