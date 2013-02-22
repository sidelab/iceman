var debug = require('debug')('ice-client'),
    http = require('http'),
    url = require('url'),
    es = require('event-stream'),
    Interactor = require('./lib/interactor'),
    _ = require('lodash'),

    phaseData = {
        connect: {
            headers: {
                'x-ice-at': 'connect'
            }
        }
    },

    reStatusOK = /^2\d{2}$/;

function ice(host, opts) {
    var urlData = url.parse(host),
        request, interactor;

    // initialise the request, sending the connect data
    request = http.request(_.extend({}, phaseData.connect, urlData), function(res) {
        debug('connect: ' + host, res.statusCode);
        if (reStatusOK.test(res.statusCode)) {
            es.pipeline(
                res,
                interactor
            );
        }
        else {
            interactor.emit('error', new Error('unexpected response'));
        }
    });

    // finish sending the request
    request.end();

    // create the interaction stream that will process the output from the server
    return (interactor = new Interactor(host));
}

module.exports = ice;