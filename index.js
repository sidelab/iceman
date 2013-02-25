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

    // include the route handlers
    routes = ['connect'].map(function(handler) {
        return require('./lib/routes/' + handler);
    }),

    // initialise the default transports
    defaultTransports = {
        sockjs: {}
    };

/**
*/
var iceman = module.exports = function(opts, callback) {
    var server, transports = [], initializers;

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

    // initialise the storage engine
    server.storage = opts.storage || require('./lib/storage-memory');

    // initialise the server clients array
    server.clients = [];

    // iterate through the transports
    _.each(opts.transports, function(config, transport) {
        transports.push(require('./lib/transports/' + transport)(server, config));
    });

    // create the initializers list
    initializers = [].map(function(taskModule) {
        return require('./lib/' + taskModule).init.bind(null, server);
    });

    // if the server storage has an init function, then add it to the initializers
    if (server.storage && typeof server.storage.init == 'function') {
        initializers.push(server.storage.init.bind(server.storage, server));
    }

    // run the initialization tasks and then get the server running
    async.parallel(initializers, function(err) {
        if (err) return callback(err);

        // run the server
        server.listen(opts.port, callback);
    });

    return server;
};

// bind the errors into the export
iceman.errors = require('./lib/errors');

/* internal helpers */

function createRequestHandler(server, opts) {
    opts = opts || {};

    // initialise all the plugins
    opts.plugins = basePlugins.concat(opts.plugins || []);

    return function(req, res) {
        // initialise the plugin handlers
        var handlers = opts.plugins.map(function(plugin) {
            return plugin.bind(null, req, res);
        });

        // add the route regex handlers
        handlers = handlers.concat(routes.map(function(route) {
            return function(callback) {
                var match = route.regex.exec(req.url);

                // if this is not a match, then immediately trigger the callback
                if (! match) return callback();

                // run the route handler
                route.handler.call(null, match, server, req, res, callback);
            };
        }));

        // run the plugins in series
        // TODO: consider parallel
        async.series(handlers, function(err) {

            console.log(req.url);
        });
    };
}