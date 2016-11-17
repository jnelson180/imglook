/* TO DO -----------------------------------------------------

User Story: I can get the image URLs, alt text and page urls for a 
set of images relating to a given search string.

User Story: I can paginate through the responses by adding a 
?offset=2 parameter to the URL.

User Story: I can get a list of the most recently submitted search strings.

// https://www.npmjs.com/package/@augmt/image-search-abstraction-layer

*/

var express = require('express');
var app = express();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var dbUrl = // NOT process.env.MONGOLAB_URI; (yet)
var port = process.env.PORT || 8080;
var absLayer = require('@augmt/image-search-abstraction-layer'); //v 0.2.6

// set up view engine and static asset dir
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));


app.listen(port, function() {
    console.log('Image Search Abstraction Layer listening at ' + port);
});