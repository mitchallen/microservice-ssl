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

An __https__ request should work.  An ___http__ request should return __404__ (not found).

### See Project README

See the __Usage__ section of the root folders __README__ for more info.