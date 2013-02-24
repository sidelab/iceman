var request = require('supertest'),
    app = 'http://localhost:3090',
    iceman = require('../'),
    uuid = require('uuid'),
    roomId = uuid.v4(),
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

    it('should return a 500 response when authentication fails', function(done) {
        server.once('auth', function(req, res, callback) {
            callback(new Error('unable to authenticate'));
        });

        request(app)
            .get('/connect/' + roomId)
            .expect(500)
            .end(done);
    });
});