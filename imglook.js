/* TO DO -----------------------------------------------------

User Story: I can get a list of the most recently submitted search strings.
*/
// example URL = https://www.googleapis.com/customsearch/v1?key=AIzaSyA1gslbPSEXtJZi_WyERVCFBD9UVed3Thg&cx=011918724492074459688:68z1b4dujci&q=lectures&searchType=image
/* example search results format 
{"url": url, "snippet": snippet, "thumbnail": thumbnail, 
"context": context}
*/
var express = require('express');
var app = express();
var https = require('https');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var dbUrl = "mongodb://localhost:27017"; // NOT process.env.MONGOLAB_URI; (yet);
var port = process.env.PORT || 8080;
var cx = "011918724492074459688:68z1b4dujci";
var apiKey = "AIzaSyA1gslbPSEXtJZi_WyERVCFBD9UVed3Thg";
// To use this key in your application, pass it with the key=API_KEY parameter.

// set up view engine and static asset dir
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

MongoClient.connect(dbUrl, function(err, db) {
    if (err) throw err;

    // get /* URL aka search term(s)
    app.get('/api/imagesearch/*', function(req, res) {
        var userQuery = req.url.substr(1);
        var term = req.params[0];
        var timestamp = (new Date().toISOString());
        var options = {
            host: "www.googleapis.com",
            path: "/customsearch/v1?key=" + apiKey + "&cx=" + cx + "&q=" + userQuery + "&searchType=image",
        };

        // send search term and timestamp to database
        var collection = db.collection('searchHistory');
        collection.insert([{
        	"term": term, "when": timestamp
        }], function(err, result) {
        	if (err) throw err;
        	console.log("Inserted " + result.ops[0] + ".");
        });

        // send GET request
        https.get(options, function(response) {
            response.setEncoding('utf-8');
            var responseString = "";

            response.on('data', function(data) {
                responseString += data;
            });

            response.on('end', function() {
                var responseObject = JSON.parse(responseString);
                var results = [];
                for (var i = 0; i < 10; i++) {
                    var curObj = {
                        url: responseObject.items[i].link,
                        snippet: responseObject.items[i].snippet,
                        thumbnail: responseObject.items[i].image.thumbnailLink,
                        context: responseObject.items[i].image.contextLink
                    }
                    results.push(curObj);
                }
                console.log(responseObject.items);
                console.log(responseObject.items.length);
                console.log(term);
        // TEST - find db data
        collection.find({        }).toArray(function(err, docs) {
        	if (err) throw err;
        	console.log(docs);
        });
                res.send(results);

            });
        });
    });

    app.get('/api/latest/imagesearch/', function(req, res) {
    	// return last 10 searches. 
    	// [{ "term": term, "when": "2016-11-22T03:10:07.927Z" }]

    });

});

app.listen(port, function() {
    console.log('Image Search Abstraction Layer listening at ' + port);
});