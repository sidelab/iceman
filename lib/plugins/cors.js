var debug = require('debug')('iceman-cors');

module.exports = function(req, res, next) {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT',
            'Access-Control-Allow-Headers': 'x-ice-at,x-ice-id',
            'Access-Control-Max-Age': 86400
        });

        return res.end();
    }

    next();
};

