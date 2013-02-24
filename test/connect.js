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

    it('should be able to make a room request', function(done) {
        request(app)
            .get('/connect/' + roomId)
            .expect(401)
            .end(done);
    });
});