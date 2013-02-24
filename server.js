var server = require('./')();

process.on('exit', function() {
    server.close();
});