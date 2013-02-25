function IceResponse(code) {
    this.code = code;  
}

module.exports = IceResponse;

IceResponse.prototype.toString = function() {
    return 'R:' + this.code;
};