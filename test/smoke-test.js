/**
    Module: @mitchallen/microservice-ssl
      Test: smoke-test
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    jwt = require('jwt-simple'),
    testName = require("../package").name,
    testVersion = require("../package").version,
    verbose = process.env.SERVICE_VERBOSE || false,
    testPort = process.env.TEST_SERVICE_PORT || 8100,
    testHost = "http://localhost:" + testPort;

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

        let testAccess = ops.access  // Access needed to acccess URL
        let testRole = ops.role;    // User role.
        let expectedStatus = ops.sslStatus;
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
                port: testPort,
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
        request(testHost)
            .get(testUrl)
            .set('x-auth', jwt.encode( testData, secret))
            .set('Content-Type', 'application/json')
            .expect(expectedStatus)
            .end(function (err, res){
                should.not.exist(err);
                should.exist(res.body);
                if( expectedStatus == 200 ) {
                    should.exist(res.body.type);
                    res.body.type.should.eql(dataType);
                    should.exist(res.body.status);
                    res.body.status.should.eql(dataStatus);
                }
                done();
            });
}

describe('microservice ssl smoke test', function() {

    afterEach(function(done) {
        return server.close(done);
    });


    // Admin Role

    it('should return 302 redirect for admin accessing admin url', function(done) {
        checkAccess( {
            role: "admin", 
            access: "admin", 
            sslStatus: 302,
            done: done
        });
    });

    it('should return 404 not-found for admin accessing admin url', function(done) {
        checkAccess( {
            role: "admin", 
            access: "admin", 
            sslStatus: 404,
            done: done
        });
    });

    it('should return 404 not-found for admin role to access user url', function(done) {
        checkAccess( {
            role: "admin", 
            access: "user", 
            status: 404,
            done: done
        });
    });

    it('should return 404 not-found for admin role to access wildcard url', function(done) {
        checkAccess( {
            role: "admin", 
            access: "*", 
            status: 404,
            done: done
        });
    });

    it('should not allow admin role to access none access url', function(done) {
        checkAccess( {
            role: "admin", 
            access: "none", 
            status: 401,
            done: done
        });
    });

    it('should not allow admin role to access unknown access url', function(done) {
        checkAccess( {
            role: "admin", 
            access: "unknown", 
            status: 401,
            done: done
        });
    });

    // User Role

    it('should not allow user role to access admin url', function(done) {
        checkAccess( {
            role: "user", 
            access: "admin", 
            status: 401,    // Unauthorized
            done: done
        });
    });

    it('should return 404 not-found user role to access user url', function(done) {
        checkAccess( {
            role: "user", 
            access: "user", 
            status: 404,
            done: done
        });
    });

    it('should return 404 not-found user role to access wildcard url', function(done) {
        checkAccess( {
            role: "user", 
            access: "*", 
            status: 404,
            done: done
        });
    });

    it('should not allow user role to access none access url', function(done) {
        checkAccess( {
            role: "user", 
            access: "none", 
            status: 401,
            done: done
        });
    });

    it('should not allow user role to access unknown access url', function(done) {
        checkAccess( {
            role: "user", 
            access: "unknown", 
            status: 401,
            done: done
        });
    });

    // Wildcard Role

    it('should not allow wildcard role to access admin url', function(done) {
        checkAccess( {
            role: "*", 
            access: "admin", 
            status: 401,    // Unauthorized
            done: done
        });
    });

    it('should not allow wildcard role to access user url', function(done) {
        checkAccess( {
            role: "*", 
            access: "user", 
            status: 401,    // Unauthorized
            done: done
        });
    });

    it('should return 404 not-found wildcard role to access wilccard url', function(done) {
        checkAccess( {
            role: "*", 
            access: "*", 
            status: 404,  
            done: done
        });
    });

    it('should not allow wildcard role to access none access url', function(done) {
        checkAccess( {
            role: "*", 
            access: "none", 
            status: 401,
            done: done
        });
    });

    it('should not allow wild card role to access unknown access url', function(done) {
        checkAccess( {
            role: "*", 
            access: "unknown", 
            status: 401,
            done: done
        });
    });

    // None Role

    it('should not allow none role to access admin url', function(done) {
        checkAccess( {
            role: "none", 
            access: "admin", 
            status: 401,
            done: done
        });
    });

    it('should not allow none role to access user url', function(done) {
        checkAccess( {
            role: "none", 
            access: "user", 
            status: 401,
            done: done
        });
    });

    it('should return 404 not-found none role to access wildcard url', function(done) {
        checkAccess( {
            role: "none", 
            access: "*", 
            status: 404,
            done: done
        });
    });


    // Unknown Role

    it('should not allow unknown role to access admin url', function(done) {
        checkAccess( {
            role: "unknown", 
            access: "admin", 
            status: 401,
            done: done
        });
    });

    it('should not allow unknown role to access user url', function(done) {
        checkAccess( {
            role: "unknown", 
            access: "user", 
            status: 401,
            done: done
        });
    });

    it('should not allow none role to access user url', function(done) {
        checkAccess( {
            role: "none", 
            access: "user", 
            status: 401,
            done: done
        });
    });

    it('should return 404 not-found  unknown role to access wildcard url', function(done) {
        // Because wildcard access is public, even unknown should have access.
        checkAccess( {
            role: "unknown", 
            access: "*", 
            status: 404,
            done: done
        });
    });

});