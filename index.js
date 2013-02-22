var uuid = require('uuid'),
    msgpack = require('msgpack-js'),
    _ = require('lodash'),

    SIZE_MSGTYPE = 1,

    messageTypes = {
        fail: 0x0,
        ack:  0x1,
        auth: 0x2
    },
    messageTypeNames = [];

    messageSizes = {
        fail: SIZE_MSGTYPE * 2,
        ack:  SIZE_MSGTYPE * 2,
        auth: SIZE_MSGTYPE + 16
    },

    deserializers = {};

/* ice main */

var ice = module.exports = function(text) {
    return msgpack.encode(text).toString('base64');
};

ice.ack = function(message) {
    return ice(new Buffer())
};

ice.decode = function(buffer) {
    // read the low order by from the buffer and determine the type
    var type = messageTypeNames[buffer.readUInt8(0)],
        data = { type: type };

    // if we have a deserializer for the message, then process
    if (typeof deserializers[type] == 'function') {
        _.extend(data, deserializers[type](buffer));
    }

    return data;
};

ice.message = function(type) {
    var msg = new Buffer(messageSizes[type] || SIZE_MSGTYPE);

    // write the message into the low byte of the buffer
    msg.writeUInt8(messageTypes[type], 0);

    // return the newly created message buffer
    return msg;
};

ice.session = function(id) {
    // create the message buffer
    var msg = ice.message('auth');

    // parse the uuid into the buffer
    uuid.parse(id, msg, SIZE_MSGTYPE);

    // return the message
    return ice(msg);
};

/* initialization */

// create the reverse lookup for message types
Object.keys(messageTypes).forEach(function(typeName) {
    messageTypeNames[messageTypes[typeName]] = typeName;
});

/* deserializers */

deserializers.auth = function(buffer) {
    return { uuid: uuid.unparse(buffer, SIZE_MSGTYPE) };
};