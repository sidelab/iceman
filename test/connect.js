var assert = require('assert'),
    sjsc = require('sockjs-client'),
    request = require('supertest'),
    app = 'http://localhost:3090',
    iceman = require('../'),
    uuid = require('uuid'),
    roomId = uuid.v4(),
    reReponse = /^R\:(\d+).*/,
    roomToken,
    server;

describe('iceman connection handshake', function() {
    before(function(done) {
        server = iceman(done);
    });

    after(function() {
        server.close();
    });

    it('should return a 401 response when no auth handlers are connected', function(done) {
        request(app)
            .get('/connect/' + roomId)
            .expect(401)
            .end(done);
    });

    it('shoudl return a 500 response when an error occurs during authentication', function(done) {
        server.once('auth', function(req, res, callback) {
            callback(new Error('Could not do something...'));
        });

        request(app)
            .get('/connect/' + roomId)
            .expect(500)
            .end(done);
        });

    it('should return a 401 response when authentication fails', function(done) {
        server.once('auth', function(req, res, callback) {
            callback();
        });

        request(app)
            .get('/connect/' + roomId)
            .expect(401)
            .end(done);
    });

    it('should return a 200 response when a user is provided', function(done) {
        server.once('auth', function(req, res, callback) {
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

    it('should be able to connect via sockjs to the server', function(done) {
        sjsc.create(app + '/room').on('connection', done);
    });

    it('should not be able to post messages prior to authenticating with the token', function(done) {
        var client = sjsc.create(app + '/room');

        client.once('data', function(msg) {
            assert(reReponse.test(msg), 'Did not receive a response from the server');
            assert.equal(RegExp.$1, 401, 'Did not receive a 401 error');

            done();
        });

        client.on('connection', function() {
            client.write('T:hi');
        });
    });

    it('should be able to auth to the room using the room token', function(done) {
        var client = sjsc.create(app + '/room');

        client.once('data', function(msg) {
            assert(reReponse.test(msg), 'Did not receive a repponse from the server');
            assert.equal(RegExp.$1, 200, 'Did not receive a 200 OK');

            done();
        });

        client.on('connection', function() {
            client.write('A:' + roomToken);
        });
    });
});