examples / access
===================

Demo implementing an SSL-only service
-------------------------------------------------

### Install

Because the __package.json__ file should already contain what you need, simply use this command to install everything:

    $ npm install

### Install and run the app

From your projects root folder, execute the following at the command line:

    $ node index.js

### Run the Key Master

Open up a second terminal window and do the following:

1. Switch to the same folder
2. Run the following:

        node key-master.js

3. Copy and paste one of the role __curl__ commands into the terminal window and hit enter.

For the __admin__ role, an __https__ request should work.  An __http__ request should return __404__ (not found).

Non-admins should get either a __401__ (unauthorized) or __404__ (not found).


### Testing for 302 (Moved)

By default, __index.js__ is setup to return a __404__ (not found) response for non-SSL requests.

Edit __index.js__ and change __404__ to __302__ to test as a service that returns a __302__ (moved) for non-SSL requests.  Note the __Location__ returned in a __302__ response.

### See Project README

See the __Usage__ section of the root folders __README__ for more info.