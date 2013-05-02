var assert = require('assert'),
    request = require('supertest'),
    app = 'http://localhost:3090',
    http = require('http'),
    iceman = require('../'),
    randomName = require('random-name'),
    uuid = require('uuid'),
    roomId = uuid.v4(),
    reResponse = /^R\:(\d+)\|?(.*)/,
    reEvent = /^E\:(.*)$/,
    roomToken,
    ice,
    client;

describe('iceman events', function() {
    before(function(done) {
        ice = iceman(http.createServer());

        // attach an auth handler
        ice.on('auth', function(req, res, callback) {
            callback(null, { nick: randomName().replace(/\s/g, '') });
        });

        ice.server.listen(3090, done);
    });

    after(function(done) {
        ice.server.close();
        process.nextTick(done);
    });

    it('should return a 200 response when a user is provided', function(done) {
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
        var room = ice.rooms[roomId],
            client = iceman.bot('http://localhost:3090/');

        room.on('message', function handleMessage(msg) {
            if (msg.type === 'USERJOIN') {
                room.removeListener('message', handleMessage);
                done();
            }
        });

        client.join(roomId);
    });

    it('should be able to get a user.exit event from the server on connection close', function(done) {
        var room = ice.rooms[roomId],
            client = iceman.bot('http://localhost:3090/');

        room.on('message', function handleMessage(msg) {
            if (msg.type === 'USERLEAVE') {
                room.removeListener('message', handleMessage);
                done();
            }
        });

        client.join(roomId).once('ready', function() {
            process.nextTick(client.close.bind(client));
        });
    });
});