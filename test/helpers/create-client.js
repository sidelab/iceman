var assert = require('assert'),
    debug = require('debug')('iceman-test'),
    iceman = require('../..'),
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

    client = iceman.bot(app);
    client.join(roomId).once('ready', function() {
        callback(null, client);
    });
};