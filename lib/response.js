function IceResponse(code) {
    this.code = code;
    this.args = Array.prototype.slice.call(arguments, 1);
}

module.exports = IceResponse;

IceResponse.prototype.toString = function() {
    return 'R:' + [this.code].concat(this.args).join('|');
};