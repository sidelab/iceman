var assert = require('assert'),
    debug = require('debug')('iceman-test'),
    http = require('http'),
    WebSocket = require('ws'),
    websocket = require('websocket-stream'),
    request = require('supertest'),
    app = 'http://localhost:3090',
    iceman = require('../'),
    uuid = require('uuid'),
    roomId = uuid.v4(),
    reResponse = /^R\:(\d+)\|?(.*)/,
    reEvent = /^E\:/,
    roomToken,
    ice,
    client,
    socket;

describe('iceman connection handshake', function() {
    before(function(done) {
        ice = iceman(http.createServer());
        ice.server.listen(3090, done);
    });

    after(function(done) {
        ice.server.close();
        process.nextTick(done);
    });

    it('should return a 401 response when no auth handlers are connected', function(done) {
        request(app)
            .get('/connect/' + roomId)
            .expect(401)
            .end(done);
    });

    it('should return a 500 response when an error occurs during authentication', function(done) {
        ice.once('auth', function(req, res, callback) {
            callback(new Error('Could not do something...'));
        });

        request(app)
            .get('/connect/' + roomId)
            .expect(500)
            .end(done);
    });

    it('should return a 401 response when authentication fails', function(done) {
        ice.once('auth', function(req, res, callback) {
            callback();
        });

        request(app)
            .get('/connect/' + roomId)
            .expect(401)
            .end(done);
    });

    it('should return a 200 response when a user is provided', function(done) {
        ice.once('auth', function(req, res, callback) {
            callback(null, { nick: 'Test' });
        });

        request(app)
            .get('/connect/' + roomId)
            .expect(200)
            .end(function(err, response) {
                assert.ifError(err);
                assert.equal(response.headers['content-type'], 'application/json');
                assert(response.body.token, 'No token found in the connect response');

                // save the room token
                roomToken = response.body.token;

                done();
            });
    });

    it('should be able to connect via websockets to the server', function(done) {
        socket = new WebSocket('ws://localhost:3090/room');

        socket.on('open', function() {
            socket.close();

            done();
        })
    });

    it('should be able to connect via the iceman client', function(done) {
        var client = iceman.bot('http://localhost:3090');

        ice.once('auth', function(req, res, callback) {
            callback(null, { nick: 'Test' });
        });

        client.join('testroom').on('ready', done);
    });
});