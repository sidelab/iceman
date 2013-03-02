var assert = require('assert'),
    sjsc = require('sockjs-client'),
    request = require('supertest'),
    app = 'http://localhost:3090',
    iceman = require('../'),
    uuid = require('node-uuid'),
    roomId = uuid.v4(),
    reResponse = /^R\:(\d+)\|?(.*)/,
    reEvent = /^E\:(.*)$/,
    roomToken,
    server,
    client;

describe('iceman events', function() {
    before(function(done) {
        server = iceman(done);
    });

    after(function(done) {
        server.close();
        process.nextTick(done);
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

    it('should be able to get a user.enter event from the server', function(done) {
        server.storage.findRoom(roomId, function(err, room) {
            var stream = (room || {}).stream;

            if (err) return done(err);

            stream.on('data', function handleMessages(msg) {
                if (reEvent.test(msg) && RegExp.$1.split('|')[0] === 'user.enter') {
                    stream.removeListener('data', handleMessages);
                    done();
                }
            });

            client = sjsc.create(app + '/room');
            client.on('connection', function() {
                client.write('A:' + roomToken);
            });
        });
    });

    it('should be able to get a user.exit event from the server on connection close', function(done) {
        server.storage.findRoom(roomId, function(err, room) {
            var stream = (room || {}).stream;

            if (err) return done(err);

            stream.on('data', function handleMessages(msg) {
                if (reEvent.test(msg)) {
                    assert.equal(RegExp.$1.split('|')[0], 'user.exit');
                    stream.removeListener('data', handleMessages);
                    done();
                }
            });

            process.nextTick(client.close.bind(client));
        });
    });
});