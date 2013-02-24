var async = require('async'),
    debug = require('debug')('iceman-server'),
    path = require('path'),
    interactor = require('./lib/interactor'),
    http = require('http'),
    _ = require('lodash'),

    // include the plugins
    basePlugins = ['cors'].map(function(plugin) {
        return require('./lib/plugins/' + plugin);
    }),

    // initialise the default transports
    defaultTransports = {
        sockjs: {}
    },

    reConnectUrl = /\/+connect\/?(.*)$/i;


function createRequestHandler(server, opts) {
    opts = opts || {};

    // initialise all the plugins
    opts.plugins = basePlugins.concat(opts.plugins || []);

    return function(req, res) {
        // initialise the plugin handlers
        var pluginHandlers = opts.plugins.map(function(plugin) {
            return plugin.bind(null, req, res);
        });

        // run the plugins in series
        // TODO: consider parallel
        async.series(pluginHandlers, function(err) {
            // route requests
            switch (true) {
                case reConnectUrl.test(req.url): {
                    // if we have no auth handlers on the server, then return a 401
                    if (server.listeners('auth').length === 0) {
                        res.writeHead(401);
                        return res.end('Unable to authenticate user');
                    }

                    console.log('connecting');
                }
            }


            console.log(req.url);
        });
    };
}

/**
*/
module.exports = function(opts, callback) {
    var server, transports = [];

    if (typeof opts == 'function') {
        callback = opts;
        opts = {};
    }

    // ensure we have opts
    opts = opts || {};

    // initialise the default port
    opts.port = opts.port || 3090;

    // initialise the transports
    opts.transports = opts.transports || defaultTransports;

    // create the server
    debug('initializing ice server on port: ' + opts.port);
    server = require(opts.https ? 'https' : 'http').createServer();
    server.on('request', createRequestHandler(server, opts));

    // iterate through the transports
    _.each(opts.transports, function(config, transport) {
        transports.push(require('./lib/transports/' + transport)(server, config));
    });

    // run the server
    server.listen(opts.port, callback);

    return server;
};