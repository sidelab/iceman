var assert = require('assert'),
    sjsc = require('sockjs-client'),
    request = require('supertest'),
    app = 'http://localhost:3090',
    iceman = require('../'),
    uuid = require('uuid'),
    roomId = uuid.v4(),
    reResponse = /^R\:(\d+)\|?(.*)/,
    reEvent = /^E\:(.*)$/,
    roomToken,
    server;

describe('iceman events', function() {
    before(function(done) {
        server = iceman(done);
    });

    after(function() {
        server.close();
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
        var client = sjsc.create(app + '/room'),
            stream = server.getRoom(roomId).stream;

        stream.on('data', function handleMessages(msg) {
            if (reEvent.test(msg) && RegExp.$1.split('|')[0] === 'user.enter') {
                stream.removeListener('data', handleMessages);
                client.close();
                done();
            }
        });

        client.on('connection', function() {
            client.write('A:' + roomToken);
        });
    });

    it('should be able to get a user.exit event from the server on connection close', function(done) {
        var client = sjsc.create(app + '/room'),
            stream = server.getRoom(roomId).stream;

        stream.on('data', function handleMessages(msg) {
            var msgType;

            if (reEvent.test(msg)) {
                msgType = RegExp.$1.split('|')[0];

                switch (msgType) {
                    case 'user.enter': {
                        client.close();
                        break;
                    }

                    case 'user.exit': {
                        stream.removeListener('data', handleMessages);
                        done();

                        break;
                    }
                }
            }
        });

        client.on('connection', function() {
            client.write('A:' + roomToken);
        });
    });
});