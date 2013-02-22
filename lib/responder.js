var debug = require('debug')('ice'),
    actionHandlers = require('./action-handlers'),
    clients = [],
    rooms = [];

module.exports = function(opts) {
    function respond(req, res) {
        // get the ice action
        var action = req.headers['x-ice-at'],
            clientId = req.headers['x-ice-id'],
            handler = actionHandlers[action];

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