var Stream = require('stream'),
    errors = require('./errors'),
    uuid = require('uuid'),
    rooms = {},
    tokens = {};

/**
## createRoomToken(roomId, user, callback)

This function is used to create a new token that will be provided by the client
when they enter the room.  If this token is not provided, then they will not be
authenticated and thus removed from the room within a specified timeout duration.

Also, while not in the authenticated state, the user will not be able to interact
within the chat room.
*/
exports.createToken = function(roomId, user, callback) {
    // ensure the room exists in the room data
    var targetRoom = rooms[roomId] || createRoom(roomId),
        token = uuid.v4();

    // now create a new token for the user within the room and
    // associate the user data with that token.
    targetRoom.users[token] = user;

    // increment the number of users in the room and return the token
    targetRoom.count += 1;

    // add the token lookup
    tokens[token] = {
        createdAt: new Date(),
        room: targetRoom
    };

    // return the token
    callback(null, token);
};

/**
## findToken(token, callback)
*/
exports.findToken = function(token, callback) {
    // lookup the token in the tokens index
    var tokenData = tokens[token];

    // if we don't have token data, return an error
    if (! tokenData) return callback(new errors.IceInvalidToken());

    // return the token data
    callback(null, tokenData, tokenData.room);
};

/**
## getRoom(token)

Get the stream for the room with the specified token
*/
exports.getRoom = function(token) {
    return rooms[token];
};

/* internal functions */

function createRoom(roomId) {
    return rooms[roomId] = {
        id: roomId,
        count: 0,
        users: {},
        connections: [],
        stream: new Stream()
    };
}