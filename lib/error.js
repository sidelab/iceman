var util = require('util');

/* IceError */

var IceError = exports.IceError = function() {
    Error.call(this);
};

IceError.prototype = new Error();
IceError.prototype.toResponse = function() {
    return 'R:' + this.code;
};

/* IceAuthError */

var IceAuthError = exports.IceAuthError = function() {
    IceError.call(this);

    this.message = 'Authentication required';
    this.code = 401;
};

util.inherits(IceAuthError, IceError);