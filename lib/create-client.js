var debug = require('debug')('iceman-client'),
    icy = require('icy');

module.exports = function(server) {
    var client = icy.client(),
        rooms = server.storage.rooms;

    client.on('join', function(targetRoom) {
        debug('client received join message for room: ' + targetRoom);
        if (rooms[targetRoom]) {
            rooms[targetRoom].addClient(client);
        }
    });

    return client;
};