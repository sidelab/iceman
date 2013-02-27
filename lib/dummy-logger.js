var logger = module.exports = function(level, message) {
};

['debug', 'info', 'warning', 'error'].forEach(function(level) {
	logger[level] = logger.bind(level);
});