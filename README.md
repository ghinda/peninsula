Peninsula mobile schedule
=========================

Unofficial mobile schedule web app for the Peninsula festival in Romania, Cluj-Napoca, 2013.

How it works
------------

* Built with Jekyll and jQuery Mobile to be accessible to as many mobile browsers as possible.
* Uses localStorage (or cookies as fallback) to store favorite programs
* Gets the schedule from the official festival website(http://peninsula.ro/), using a Node.js scraper built with [cheerio](https://github.com/MatthewMueller/cheerio). The scraper then generates all the markdown files for the artists and locations.


Licensed under the GPLv3.