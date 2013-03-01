module.exports = function() {
	return 'E:' + Array.prototype.join.call(arguments, '|');
};