var assert = require('assert'),
    debug = require('debug')('iceman-test'),
    WebSocket = require('ws'),
    websocket = require('websocket-stream'),
    request = require('supertest'),
    app = 'http://localhost:3090',
    icy = require('icy'),
    iceman = require('../'),
    uuid = require('node-uuid'),
    roomId = uuid.v4(),
    reResponse = /^R\:(\d+)\|?(.*)/,
    reEvent = /^E\:/,
    roomToken,
    server,
    client,
    socket;

describe('iceman connection handshake', function() {
    before(function(done) {
        server = iceman(done);
    });

    after(function(done) {
        server.close();
        process.nextTick(done);
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
        socket = new WebSocket('ws://localhost:3090/room');

        socket.on('open', function() {
            socket.close();

            done();
        })
    });

    it('should be able to join a room via a websocket', function(done) {
        var socket = websocket(new WebSocket('ws://localhost:3090/'));

        socket.on('open', function() {
            debug('creating client');
            client = icy.client();

            // piping magic
            client
                .pipe(icy.upstream(client))
                .pipe(socket)
                .pipe(icy.downstream(client))
                .pipe(client);

            client.once('joinok', function() {
                done();
            });

            // join the test room
            client.join(roomId);
        });
    });

    it('should not be able to post messages prior to authenticating with the token', function(done) {


        // client.sendText('hi');

        /*
        client = new WebSocket('ws://localhost:3090/room');

        client = sjsc.create(app + '/room');

        client.once('data', function(msg) {
            client.close();
            throw new Error('Should not have received any data from the server - unauthorized');
        });

        setTimeout(function() {
            client.close();
            done();
        }, 100);

        client.on('connection', function() {
            client.write('0Thi');
        });
        */
    });

    /*
    it('should be able to auth to the room using the room token', function(done) {
        client = sjsc.create(app + '/room');

        client.on('data', function(msg) {
            console.log(msg);
            if (reResponse.test(msg)) {
                assert.equal(RegExp.$1, 200, 'Did not receive a 200 OK');

                client.removeAllListeners('data');
                done();
            }
        });

        client.on('connection', function() {
            client.write('0A' + roomToken);
        });
    });

    */
    
    /*
    it('should be able to send messages once authenticated', function(done) {
        var responseCount = 0;

        client.on('data', function handleResponse(msg) {
            if (reResponse.test(msg)) {
                // increment the responsecount
                responseCount += 1;

                // test the response is ok
                assert.equal(RegExp.$1, 200, 'Did not receive a 200 OK');

                // if we've had two responses we are done
                if (responseCount >= 2) {
                    client.removeAllListeners('data');
                    client.close();
                    done();
                }
                else {
                    client.write('T:hi there');
                }
            }

        });

        client.write('A:' + roomToken);
    });
*/
});