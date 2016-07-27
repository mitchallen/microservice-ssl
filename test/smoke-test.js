/**
    Module: @mitchallen/microservice-ssl
      Test: smoke-test
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    jwt = require('jwt-simple'),
    config = require('./config.js'),
    testName = require("../package").name,
    testVersion = require("../package").version,
    verbose = process.env.SERVICE_VERBOSE || false,
    localPort = config.port,        
    testHost = config.host.url,
    sslHost = config.host.ssl;

let rightsWare = require('@mitchallen/microservice-rights');
let sslWare = require('../index');

let table = {
    roles: [ "none", "admin", "user", "public" ],
    rights: {
        /// required rights : list of who can access links marked with required rights]
        // link marked admin can only be accessed by admin
        "admin"  : [ "admin" ], 
        // link marked user can be accessed by admin and user
        "user"   : [ "admin", "user" ], 
        // link marked public can be accessed by all
        "*"      : [ "admin", "user", "*" ]    
    }
};

let coreModulePath = "@mitchallen/microservice-core";
let prefix = "/test1";
let path = "/admin/home";
let dataType = "heartbeat";
let dataStatus = "OK";

var server = null;

function checkAccess( ops ) {

        let host = ops.host;

        // console.log(host);

        let testAccess = ops.access  // Access needed to acccess URL
        let testRole = ops.role;    // User role.
        let expectedStatus = ops.expectedStatus;
        let done = ops.done;
        let sslStatus = ops.sslStatus;

        should.exist(sslStatus);

        let testUser = "Jack";

        let testData = {
            user: testUser,
            role: testRole
        }

        let secret = "mySecret";

        let tokenHandler = require('@mitchallen/microservice-token')(secret);

        should.exist(tokenHandler);

        var authorization = {
            access: testAccess,
            table: table
        };

        var sslOptions = {
            sslStatus: sslStatus,
            apiVersion: prefix
        };

        var options = {
            service: {
                name: testName,
                version: testVersion,
                verbose: verbose,
                port: localPort,
                apiVersion: prefix,
                method: function (info) {
                    var router = info.router;
                    router.use(tokenHandler);
                    router.get( path, 
                        // Test SSL
                        sslWare.isSSL(sslOptions),
                        rightsWare.isAuthorized( authorization ),
                        function (req, res) {
                            should.exist(req.token);
                            should.exist(req.token.user);
                            should.exist(req.token.role);
                            req.token.user.should.eql(testUser);
                            req.token.role.should.eql(testRole);
                            var data = {
                                type: dataType,
                                status: dataStatus,
                            };
                            res.json(data);
                        });
                    return router;
                }
            }
        };
        
        // Needed for cleanup between tests
        delete require.cache[require.resolve(coreModulePath)];
        var retObj = require(coreModulePath)(options);
        should.exist(retObj);
        server = retObj.server;
        should.exist(server);
        
        var testUrl =  prefix + path;
        request(host)
            .get(testUrl)
            .set('x-auth', jwt.encode( testData, secret))
            .set('Content-Type', 'application/json')
            .expect(expectedStatus)
            .end(function (err, res){
                should.not.exist(err);
                should.exist(res.body);
                if( expectedStatus == 302 ) {
                    should.not.exist(err);
                };
                if( expectedStatus == 200 ) {
                    should.exist(res.body.type);
                    res.body.type.should.eql(dataType);
                    should.exist(res.body.status);
                    res.body.status.should.eql(dataStatus);
                };
                done();
            });
}

describe('microservice ssl service', function() {

    afterEach(function(done) {
        return server.close(done);
    });

    // Admin Role

    it('should return 404 not-found for admin accessing non-ssl url', function(done) {
        checkAccess( {
            role: "admin", 
            access: "admin", 
            host: testHost, // non-ssl
            sslStatus: 404, // if this is non-ssl, return 404
            expectedStatus: 404,
            done: done
        });
    });

    it('should return 302 redirect for admin accessing non-ssl url', function(done) {
        checkAccess( {
            role: "admin", 
            access: "admin",
            host: testHost, // non-ssl 
            sslStatus: 302, // if this is non-ssl, return 302 (Moved)
            expectedStatus: 302,
            done: done
        });
    });

    it('should return 200 OK for admin accessing ssl url if non-ssl returns 404', function(done) {
        checkAccess( {
            role: "admin", 
            access: "admin", 
            host: sslHost, // SSL
            sslStatus: 404, // if this is non-ssl, return 404
            expectedStatus: 200,
            done: done
        });
    });

    it('should return 200 OK for admin accessing ssl url if non-ssl returns 302', function(done) {
        checkAccess( {
            role: "admin", 
            access: "admin", 
            host: sslHost, // SSL
            sslStatus: 302, // if this is non-ssl, return 302 (Moved)
            expectedStatus: 200,
            done: done
        });
    });

    // User Role

    it('should return 404 not-found for user accessing non-ssl admin url', function(done) {
        checkAccess( {
            role: "user", 
            access: "admin", 
            host: testHost, // non-ssl
            sslStatus: 404, // if this is non-ssl, return 404
            expectedStatus: 404,
            done: done
        });
    });

    it('should return 302 redirect for user accessing non-ssl admin url', function(done) {
        checkAccess( {
            role: "user", 
            access: "admin",
            host: testHost, // non-ssl 
            sslStatus: 302, // if this is non-ssl, return 302 (Moved)
            expectedStatus: 302,
            done: done
        });
    });

    it('should return 401 Unauthorized for user accessing ssl admin url if non-ssl url returns 404', function(done) {
        checkAccess( {
            role: "user", 
            access: "admin", 
            host: sslHost, // SSL
            sslStatus: 404, // if this is non-ssl, return 404
            expectedStatus: 401,    // Unauthorized
            done: done
        });
    });

    it('should return 401 Unauthorized for user accessing admin ssl url if non-ssl returns 302', function(done) {
        checkAccess( {
            role: "user", 
            access: "admin", 
            host: sslHost, // SSL
            sslStatus: 302, // if this is non-ssl, return 302 (Moved)
            expectedStatus: 401,    // Unauthorized
            done: done
        });
    });


});