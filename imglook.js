var express = require('express');
var app = express();
var https = require('https');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var dbUrl = process.env.MLAB_IMGLOOK_URI;
var port = process.env.PORT || 8080;
var cx = process.env.GOOGLE_CX;
var apiKey = process.env.GOOGLE_APIKEY;

// set up view engine and static asset dir
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

MongoClient.connect(String(dbUrl), function(err, db) {
    if (err) throw err;
    var collection = db.collection('searchHistory');

    // serve home page
    app.get('/api/imagesearch/', function(req, res) {
        console.log("Visitor to home page.");
        res.render('index');
        res.end();
    });

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
        collection.insert([{
            "term": term,
            "when": timestamp
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
                res.send(results);
            });
        });
    });

    app.get('/api/latest/imagesearch/', function(req, res) {
        // return last 10 searches. 
        db.collection('searchHistory').find({}, {
            _id: 0,
            qty: 0
        }).sort({
            $natural: -1
        }).limit(10).toArray(function(err, docs) {
            if (err) throw err;
            res.send(docs);
        })
    });

});

app.listen(port, function() {
    console.log('Image Search Abstraction Layer listening at ' + port);
});