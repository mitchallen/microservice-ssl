@ mitchallen / microservice-ssl
==================================

A module for managing SSL access
---------------------------------------------------------
This module works in association with other modules based on the [@mitchallen/microservice-core](https://www.npmjs.com/package/@mitchallen/microservice-core) module. For a background on the core and microservices, visit the core npm page.

* * * 

## Disclaimer

__The author makes no claims that this system is secure. Use at your own risk.__

* * *

## Installation

You must use __npm__ __2.7.0__ or higher because of the scoped package name.

    $ npm init
    $ npm install @mitchallen/microservice-ssl --save
  
* * *

## Usage

This module gives you the ability to decide how non-SSL requests are handled by an __ExpressJS__ based app or microservice.

* __404 - NOT FOUND__: if someone tries to access an SSL URL with a non-SSL protocal (__http__).
* __302 - MOVED__: redirect them to the SSL (__https__) equivalent. 

When used in combination with [@mitchallen/microservice-rights](https://www.npmjs.com/package/@mitchallen/microservice-rights) those without permission will get either a __401__ (unauthorized) for secure attempts and __404__ (not found) for non-secure attempts.

### Step 1: Setup npm dependencies

Open up a terminal window, create a folder for our app and change to it.  Then setup your npm package dependencies.

    $ npm init
    # npm install @mitchallen/microservice-ssl --save
    $ npm install @mitchallen/microservice-rights --save
    $ npm install @mitchallen/microservice-token --save
    $ npm install @mitchallen/microservice-core --save
    
### Step 2: Setup a secret key for your token

Create an environment variable holding your __secret__ key. This is used by the token middleware to encrypt the user role.

    $ export SECRET=mySecret

### Step 3: Create a file called index.js 

Create a file called __index.js__ and add the following:


## Setting up for SSL

In order to run the tests and the demo, you need to add two more variables to your environment: __TEST_HOST__ and __TEST_SSL__

For testing, I use the services of [__https://ngrok.com__](https://ngrok.com) - for a small annual fee I secured a subdomain that I can tunnel back to a port on my localhost for testing.  It supports both SSL and Non-SSL.

### Using ngrok (with a paid custom subdomain plan)

__Disclaimer:__ *I have no association with __ngrok__ and do not get any sort of commission for recommending them.*

These instructions are if you have a paid plan with __ngrok__ which will allow you to use custom subdomains.

Substituting __*YOURSUBDOMAIN*__ with some unique subdomain: from the command line type the following (assumes ngrok is on your path):

    ./ngrok http -subdomain=YOURSUBDOMAIN 8100

If your service is running on port 8100 locally, you can then access it via:

	http://YOURSUBDOMAIN.ngrok.io
	https://YOURSUBDOMAIN.ngrok.io

* * *

Note the URLs that are displayed (may be __*.io__ instead of __*.com__).

### Set environment variables

Using a text editor, append this to the bottom of __~/.bash_profile__

    # Via ngrok
    export TEST_HOST=http://YOURSUBDOMAIN.ngrok.io
    export TEST_SSL=https://YOURSUBDOMAIN.ngrok.io

Source the changes:

    $ source ~/.bash_profile
    
__Note:__ if you toggle back to an already open terminal window these values may not yet be available. You can always run the __source__ command again in that window.

Type the following at the command line:

    $ node index.js

Leave that running.

### Step 4: Create the Key Master

Normally we might generate a token from a login service. But since we don't have a login service, we need to fake it.

Open up a new terminal window and switch to the same directory.

Since we didn't take steps to make our environment variable permanent, you will need to recreate it for this new window.

    $ export SECRET=mySecret

Create a file called __key-master.js__, add the following and save it:

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
        url: process.env.TEST_HOST || "http://localhost:8100" ,
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

### Step 5: Generate the tokens and curl commands

At the command line, type: 

    $ node key-master.js

It will produce output like this (*note that for your secret key the tokens will be different!*):

    -------------------------------------------------

    token:

    eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiSmFjayIsInJvbGUiOiJhZG1pbiJ9.rM2EJZ4s1StvcoeMh9K6P1LFWhlCwMKsGsAVH11z93M

    {"user":"Jack","role":"admin"}

    curl -i -X GET -H "x-auth:     eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiSmFjayIsInJvbGUiOiJhZG1pbiJ9.rM2EJZ4s1StvcoeMh9K6P1LFWhlCwMKsGsAVH11z93M" -H "Content-Type: application/json" https://YOURSUBDOMAIN.ngrok.io/v1/admin/home


    -------------------------------------------------

    token:

    eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiSmFjayIsInJvbGUiOiJ1c2VyIn0.Y58tW4t4uYZPUX3iP2qFCHAcTOtgUPcQjD3Kds1f0Ik

    {"user":"Jack","role":"user"}

    curl -i -X GET -H "x-auth: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiSmFjayIsInJvbGUiOiJ1c2VyIn0.Y58tW4t4uYZPUX3iP2qFCHAcTOtgUPcQjD3Kds1f0Ik" -H "Content-Type: application/json" https://YOURSUBDOMAIN.ngrok.io/v1/admin/home


    -------------------------------------------------

    token:

    eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiSmFjayIsInJvbGUiOiIqIn0.G0ivI5iG-_f6km_vV-xBHrT_lWN5v8agyapJfDnm9ts

    {"user":"Jack","role":"*"}

    curl -i -X GET -H "x-auth: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiSmFjayIsInJvbGUiOiIqIn0.G0ivI5iG-_f6km_vV-xBHrT_lWN5v8agyapJfDnm9ts" -H "Content-Type: application/json" https://YOURSUBDOMAIN.ngrok.io/v1/admin/home


-------------------------------------------------
  

Based on whatever secret key you defined it will generate a token and curl command for each role.  

### Step 6: Test SSL and rights access

Copy and paste the curl commands for each role into the second terminal window.

For example (your token may be different based on your secret key):

    curl -i -X GET -H "x-auth:     eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiSmFjayIsInJvbGUiOiJhZG1pbiJ9.rM2EJZ4s1StvcoeMh9K6P1LFWhlCwMKsGsAVH11z93M" -H "Content-Type: application/json" https://YOURSUBDOMAIN.ngrok.io/v1/admin/home

For the admin role you should get a HTTP __200 OK__ response like this:

    HTTP/1.1 200 OK
    X-Powered-By: Express
    Content-Type: application/json; charset=utf-8
    Content-Length: 44
    
But if you edit the __curl__ command and change __https__ to just __http__ you should get a __404__.

If you edit the example __index.js__ file and changed __404__ to __302__, then make a request using non-SSL you should get a __302__ response that include the location of the secrure version.

    HTTP/1.1 302 Found
    X-Powered-By: Express
    Location: https://mitchallen.ngrok.io/v1/admin/home
    Vary: Accept
    Content-Type: text/plain; charset=utf-8
    Content-Length: 63

For the other roles you should get an HTTP __401__ (unauthorized) response when trying to access the secure url, or a __404__ when trying to access the non-secure URL. 

    HTTP/1.1 401 Unauthorized
    X-Powered-By: Express
    X-Content-Type-Options: nosniff
    Content-Type: text/html; charset=utf-8
    Content-Length: 16
    Connection: keep-alive

The code above can be found in the __examples / ssl-demo__ folder.

* * *

## Testing

See notes above about using a service like __ngrok__ to map to SSL.

Tests assume that __mocha__ has been installed globally.  If not execute the following (you may need to use __sudo__):

    $ npm install -g mocha

To test, go to the root folder and type (sans __$__):

    $ npm test
   
* * *
 
## Repo(s)

* [bitbucket.org/mitchallen/microservice-ssl.git](https://bitbucket.org/mitchallen/microservice-ssl.git)

* * *

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

* * *

## Version History

#### Version 0.1.2 release notes

* updated demo for port consistency
* fixed type-os in readme

#### Version 0.1.1 release notes

* updated demo to use published package

#### Version 0.1.0 release notes

* initial release