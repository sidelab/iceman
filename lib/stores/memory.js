var Stream = require('stream'),
    errors = require('../errors'),
    uuid = require('uuid'),
    rooms = {},
    tokens = {};

function MemoryStore(server, opts) {
    // initilaise the rooms and tokens collections
    this.rooms = {};
    this.tokens = {};
}

/**
## createToken(roomId, user, callback)

This function is used to create a new token that will be provided by the client
when they enter the room.  If this token is not provided, then they will not be
authenticated and thus removed from the room within a specified timeout duration.

Also, while not in the authenticated state, the user will not be able to interact
within the chat room.
*/
MemoryStore.prototype.createToken = function(roomId, user, callback) {
    // ensure the room exists in the room data
    var store = this,
        token = uuid.v4();

    // find the room
    this.findRoom(roomId, function(err, room) {
        if (err) return callback(err);

        // if the room does not exist, then create the room and
        // attempt token creation again
        if (! room) {
            return store.createRoom(roomId, function(err) {
                if (err) return callback(err);
                store.createToken(roomId, user, callback);
            });
        }

        // now create a new token for the user within the room and
        // associate the user data with that token.
        room.users[token] = user;

        // add the token lookup
        store.tokens[token] = {
            createdAt: new Date(),
            room: room
        };

        // return the token
        callback(null, token, room);
    });
};

/**
## createRoom(roomId, callback)

Create a new room in the store
*/
MemoryStore.prototype.createRoom = function(roomId, callback) {
    this.rooms[roomId] = {
        id: roomId,
        count: 0,
        users: {},
        connections: [],
        stream: new Stream()
    };

    callback(null, this.rooms[roomId]);
};

/**
## findRoom(roomId, callback)

Find the room specified by the roomid
*/
MemoryStore.prototype.findRoom = function(roomId, callback) {
    // return the room via the callback
    callback(null, this.rooms[roomId]);
};

/**
## findToken(token, callback)

Find the token data associated with the requested token
*/
MemoryStore.prototype.findToken = function(token, callback) {
    // lookup the token in the tokens index
    var tokenData = tokens[token];

    // if we don't have token data, return an error
    if (! tokenData) return callback(new errors.IceInvalidToken());

    // return the token data
    callback(null, tokenData, tokenData.room);
};

/* exports */

module.exports = function(server, opts, callback) {
    // create a new memory store
    callback(null, new MemoryStore(server, opts));
};