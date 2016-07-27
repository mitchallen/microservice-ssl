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

### SSL
    
A value of 404 means that if a user attempts to browse to the Non-SSL version of the URL a 404 (Not Found) status will be returned.

A value of 302 (Moved) will result in the user being redirected to the SSL equivalent of the request.


## Testing

In order to run the tests, you need to add two more variables to your environment: __TEST_HOST__ and __TEST_SSL__

For testing, I use the services of [__https://ngrok.com__](https://ngrok.com) - for a small annual fee I secured a subdomain
that I can tunnel back to a port on my localhost for testing.  It supports both SSL and Non-SSL.

* * *

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

### Set environment vairables

Using a text editor, append this to the bottom of __~/.bash_profile__

    # Via ngrok
    export TEST_HOST=http://YOURSUBDOMAIN.ngrok.io
    export TEST_SSL=https://YOURSUBDOMAIN.ngrok.io

Source the changes:

    $ source ~/.bash_profile
    

* * *

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

#### Version 0.1.0 release notes

* initial release