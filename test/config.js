/**
 * test-config.js
 */

"use strict";

var config = {};

// port for local service
config.port = process.env.TEST_PORT || 8100,

config.host = {
    // Tunnled URLS may have their own port (or none at all)
    url: process.env.TEST_HOST || "http://localhost:8100" ,
    ssl: process.env.TEST_SSL || null
};

module.exports = config;