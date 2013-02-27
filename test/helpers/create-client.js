var assert = require('assert'),
    debug = require('debug')('iceman-test'),
    sjsc = require('sockjs-client'),
    request = require('supertest'),
    app = 'http://localhost:3090',
    reReponse = /^R\:(\d+).*/;

module.exports = function(roomId, index, callback) {
    var client;

    debug('creating client: connecting to: ' + app + '/connect/' + roomId);

    request(app)
        .get('/connect/' + roomId)
        .expect(200)
        .end(function(err, res) {
            if (err) return callback(err);

            assert(res.body && res.body.token, 'No token found for connection');

            // create the socket client
            client = sjsc.create(app + '/room');

            // handle data
            client.once('data', function(msg) {
                // test the response is ok
                assert(reReponse.test(msg), 'Did not receive a response from the server');
                assert.equal(RegExp.$1, 200, 'Did not receive a 200 OK');

                // return the client
                callback(null, client);
            });

            client.on('connection', function() {
                client.write('A:' + res.body.token);
            });
        });
};