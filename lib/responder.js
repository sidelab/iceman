var debug = require('debug')('ice'),
    actionHandlers = require('./action-handlers'),
    clients = [],
    rooms = [];

module.exports = function(opts) {
    function respond(req, res) {
        // get the ice action
        var action = req.method === 'PUT' ? 'send' : req.headers['x-ice-at'],
            clientId = req.headers['x-ice-id'],
            handler = actionHandlers[action];

        if (req.method === 'OPTIONS') {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT',
                'Access-Control-Allow-Headers': 'x-ice-at,x-ice-id',
                'Access-Control-Max-Age': 86400
            });

            return res.end();
        }

        // delegate to the action handler
        if (typeof handler == 'function') {
            handler.call(this, req, res);
        }
        else {
            debug('no action handler found - returning 404');
            res.writeHead(404);
            res.end();
        }
    }

    return respond;
};