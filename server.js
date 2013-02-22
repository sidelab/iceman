var server = require('./lib/server')();

process.on('exit', function() {
    server.close();
});