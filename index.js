var async = require('async'),
    debug = require('debug')('iceman-server'),
    path = require('path'),
    http = require('http'),
    util = require('util'),
    EventEmitter = require('events').EventEmitter,
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

function Ice(server, options) {
    // ensure we have default opts
    var opts = options || {};

    // bind to the http server
    this.server = server;

    // initialise the transports
    this.transports = opts.transports || defaultTransports;

    // create the logger
    this.logger = opts.logger || require('./lib/dummy-logger');

    // initialise the default handlers
    this._handlers = basePlugins.concat(opts.plugins || []);

    // initialise rooms and tokens
    this.rooms = {};
    this.tokens = {};

    // handle requests
    this.server.on('request', this._handleRequest.bind(this));

    // initialise
    this._init();
}

util.inherits(Ice, EventEmitter);

/**
## use(handler)

Add the handler function to ice server handling
*/
Ice.prototype.use = function(handler) {
    this._handlers.push(handler);

    return this;
};

/**
## _handleRequest

*/
Ice.prototype._handleRequest = function(req, res) {
    // initialise the plugin handlers
    var ice = this,
        handlers = this._handlers.map(function(plugin) {
            return plugin.bind(null, req, res);
        });

    // add the route regex handlers
    handlers = handlers.concat(routes.map(function(route) {
        return function(callback) {
            var match = route.regex.exec(req.url);

            // if this is not a match, then immediately trigger the callback
            if (! match) return callback();

            // run the route handler
            route.handler.call(ice, match, req, res, callback);
        };
    }));

    // run the plugins in series
    async.series(handlers, function(err) {
    });
};

/**
## _init()
*/
Ice.prototype._init = function() {
    var ice = this;

    // iterate through the transports
    debug('initializing ice');
    _.each(this.transports, function(config, transport) {
        debug('transport: ' + transport);
        require('./lib/transports/' + transport).call(ice, config);
    });

    /*
    // create the initializers list
    initializers = [].map(function(taskModule) {
        return require('./lib/' + taskModule).init.bind(null, server, opts);
    });

    // run the initialization tasks and then get the server running
    async.parallel(initializers, function(err) {
        if (err) return callback(err);

        // run the server
        server.listen(opts.port, callback);
    });
    */
};

/**
*/
var iceman = module.exports = function(server, options) {
    return new Ice(server, options);
};

iceman.client = require('./client');
iceman.bot = require('./bot');