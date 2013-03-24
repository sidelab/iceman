var assert = require('assert'),
    debug = require('debug')('iceman-test'),
    request = require('supertest'),
    app = 'http://localhost:3090',
    reResponse = /^R\:(\d+)\|?(.*)/;

module.exports = function(roomId, index, callback) {
    var client;

    // handle the two argument case
    if (typeof index == 'function') {
        callback = index;
        index = 0;
    }

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
            client.on('data', function handleResponse(msg) {
                if (reResponse.test(msg)) {
                    assert.equal(RegExp.$1, 200, 'Did not receive a 200 OK');

                    client.removeListener('data', handleResponse);
                    client.id = parseInt(RegExp.$2, 10);

                    callback(null, client);
                }
            });

            client.on('connection', function() {
                client.write('A:' + res.body.token);
            });
        });
};