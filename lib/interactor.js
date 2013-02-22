var Stream = require('stream'),
    util = require('util');

function Interactor() {
    Stream.call(this);

    this.readable = true;
    this.writable = true;
}

util.inherits(Interactor, Stream);

/**
## write(data)
*/
Interactor.prototype.write = function(data) {
    console.log('received data', data.toString());
    this.emit('data', data);
};

module.exports = Interactor;