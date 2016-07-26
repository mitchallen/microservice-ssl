/**
    module: @mitchallen/microservice-ssl
    author: Mitch Allen
*/

/* Usage:
 *
 * var sslWare = require( '@mitchallen/microservice-ssl' )();
 *
 * router.get('/heartbeat', sslWare.isSSL(sslStatus), function (req, res) { ... }
 *
 */

/*jslint es6 */

"use strict";

var lib = {};

lib.isSSL = function (options) {

    var sslStatus = options.sslStatus;
    var prefix = options.apiVersion;

    return function (req, res, next) {
        if (sslStatus) {
            if (req.connection.encrypted || (req.headers['x-forwarded-proto'] === "https")) {
                return next();
            }
            if (sslStatus === 302) {
                return res.redirect("https://" + req.headers.host + prefix + req.url);
            }
            if (sslStatus === 404) {
                // Instead of redirecting, return not found
                return res.sendStatus(404);
            }
            emsg = "INTERNAL ERROR: Only 302 or 404 allowed for sslStatus.";
            return next({ status: 500, message: emsg, type: 'internal'});
        }
        next();
    };
};

module.exports = lib;