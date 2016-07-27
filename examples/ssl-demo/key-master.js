/**
    Author: Mitch Allen
      File: key-master.js
*/

"use strict";

let secret = process.env.SECRET || "test-server"; 
let port = process.env.SERVICE_PORT || 8100;
let jwt = require('jwt-simple');
let roles = ['admin','user','*'];
let bar = Array(50).join('-');

let host = {
    // Tunnled URLS may have their own port (or none at all)
    url: process.env.TEST_HOST || "http://localhost:8001" ,
    ssl: process.env.TEST_SSL || null
};

roles.forEach(function(value) {
    let testData = {
        user: 'Jack',
        role: value
    }

    var token = jwt.encode( testData, secret)
    
    console.log("%s\n\ntoken:\n\n%s\n\n%s", bar, token, JSON.stringify(testData));

    console.log(
        '\ncurl -i -X GET -H "x-auth: ' + token + '" ' +
        '-H "Content-Type: application/json" ' + host.ssl + '/v1/admin/home\n\n');
}); 

console.log(bar);