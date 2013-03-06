var async = require('async'),
    debug = require('debug')('iceman-server'),
    path = require('path'),
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
        ws: {}
    };

/**
*/
var iceman = module.exports = function(opts, callback) {
    var server, transports = [], initializers,
        storageInitializer;

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

    // create the storage initializer
    storageInitializer = opts.storage || require('./lib/stores/memory');

    // create the server
    debug('initializing ice server on port: ' + opts.port);
    server = require(opts.https ? 'https' : 'http').createServer();
    server.on('request', createRequestHandler(server, opts));

    // initialise the logger
    server.logger = opts.logger || require('./lib/dummy-logger');

    // initialise the server rooms
    server.rooms = {};

    // create the additional handlers array
    server._handlers = basePlugins.concat(opts.plugins || []);
    server.use = function(handler) {
        server._handlers.push(handler);
    };

    // iterate through the transports
    _.each(opts.transports, function(config, transport) {
        transports.push(require('./lib/transports/' + transport)(server, config));
    });

    // create the initializers list
    initializers = [].map(function(taskModule) {
        return require('./lib/' + taskModule).init.bind(null, server, opts);
    });

    // add the storage initialization to the initialization tasks
    initializers.push(function(callback) {
        storageInitializer(server, opts, function(err, storage) {
            server.storage = storage;
            callback.apply(this, arguments);
        });
    });

    // run the initialization tasks and then get the server running
    async.parallel(initializers, function(err) {
        if (err) return callback(err);

        // run the server
        server.listen(opts.port, callback);
    });

    return server;
};

/* internal helpers */

function createRequestHandler(server, opts) {
    opts = opts || {};

    return function(req, res) {
        // initialise the plugin handlers
        var handlers = server._handlers.map(function(plugin) {
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
        async.series(handlers, function(err) {
        });
    };
}