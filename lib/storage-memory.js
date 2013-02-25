var uuid = require('uuid'),
    rooms = {};

/**
## createRoomToken(roomId, user)

This function is used to create a new token that will be provided by the client
when they enter the room.  If this token is not provided, then they will not be
authenticated and thus removed from the room within a specified timeout duration.

Also, while not in the authenticated state, the user will not be able to interact
within the chat room.
*/
exports.createRoomToken = function(roomId, user) {
    // ensure the room exists in the room data
    var targetRoom = rooms[roomId] || createRoom(roomId),
        token = uuid.v4();

    // now create a new token for the user within the room and
    // associate the user data with that token.
    targetRoom.users[token] = user;

    // increment the number of users in the room and return the token
    targetRoom.count += 1;
    return token;
};

/* internal functions */

function createRoom(roomId) {
    return rooms[roomId] = {
        count: 0,
        users: {}
    };
}