var msgpack = require('msgpack-js'),

    SIZE_MSGTYPE = 1,

    messageTypes = {
        fail: 0x0,
        ack:  0x1,
        auth: 0x2,
    },
    messageTypeNames = [];

    messageSizes = {
        fail: SIZE_MSGTYPE * 2,
        ack:  SIZE_MSGTYPE * 2,
    },

    serializers = {},
    deserializers = {};


var encode = exports.encode = function(input) {
    return msgpack.encode(input);
};

exports.ack = function(message) {
    // initialise an ack command
    var msg = exports.create('ack');

    // write the command that is being acknowledged into the message
    msg.writeUInt8(messageTypes[message], 1);

    return msgpack.encode(msg);
};

/**
## create(type)
*/
exports.create = function(type) {
    var msg = new Buffer(messageSizes[type] || SIZE_MSGTYPE);

    // write the message into the low byte of the buffer
    msg.writeUInt8(messageTypes[type], 0);

    // return the newly created message buffer
    return msg;
};

/**
## decode(buffer)
*/
exports.decode = function(buffer) {
    // read the low order by from the buffer and determine the type
    var type = messageTypeNames[buffer.readUInt8(0)],
        data = { type: type };

    // if we have a deserializer for the message, then process
    if (typeof deserializers[type] == 'function') {
        _.extend(data, deserializers[type](buffer));
    }

    return data;
};

/**
## session(id)
*/
exports.session = function(id) {
    // return the message
    return msgpack.encode({ session: id });
};

/* initialization */

// create the reverse lookup for message types
Object.keys(messageTypes).forEach(function(typeName) {
    messageTypeNames[messageTypes[typeName]] = typeName;
});

/* serializers */

serializers.auth = function(data) {

};

/* deserializers */

deserializers.auth = function(buffer) {
    return { uuid: uuid.unparse(buffer, SIZE_MSGTYPE) };
};