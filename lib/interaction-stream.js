var Stream = require('stream'),
    util = require('util');

function InteractionStream() {
    Stream.call(this);

    this.readable = true;
    this.writable = true;
}

util.inherits(InteractionStream, Stream);

/**
## write(data)
*/
InteractionStream.prototype.write = function(data) {
    console.log(data);
    this.emit(data);
};

module.exports = InteractionStream;