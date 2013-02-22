var uuid = require('uuid');

/**
## connect(req, res)
*/
exports.connect = function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
    });

    res.write('cid: ' + uuid.v4());
};