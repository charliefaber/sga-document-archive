var express = require('express');
var router = express.Router();
var multiparty = require('connect-multiparty')();
var User = require('../models/User');
var fs = require('fs');
var mongoose = require('mongoose');
var Gridfs = require('gridfs-stream');
router.post('/upload/:id', multiparty, function(req, res){
   var db = mongoose.connection.db;
   var mongoDriver = mongoose.mongo;
   var gfs = new Gridfs(db, mongoDriver);
   var writestream = gfs.createWriteStream({
     filename: req.files.file.name,
     mode: 'w',
     content_type: req.files.file.mimetype,
     metadata: req.body
   });
   fs.createReadStream(req.files.file.path).pipe(writestream);
   writestream.on('close', function(file) {
      User.findById(req.params.id, function(err, user) {
        // handle error
        user.file = file._id;
        user.save(function(err, updatedUser) {
          // handle error
          return res.json(200, updatedUser)
        })
      });
      fs.unlink(req.files.file.path, function(err) {
        // handle error
        console.log('success!')
      });
   });
}

/*var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/upload.html'));
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});
*/

//Stuff below this is just me playing around with code I found on forums and such
//None of it works fully, not even the stuff not commented
/*

var http = require('http');
var fs = require('fs');
var assert = require('assert');

var express = require('express');
var app = express();

var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

var MongoClient = mongo.MongoClient;
var url = "mongodb://charliefaber:c0d3rKing195@ds143340.mlab.com:43340/sgadb";
var sgadb;

var myDate = new Date("2017-3-27");

var insertDocument = function(db, callback) {
    db.collection('resolution').insertOne( {
		"path": "./public"
		"name": "SR1617.01", 
		"date": myDate, 
		"session": 1617, 
		"tagline": "To approve the nomination of blah blah blah", 
		"sponsors": [{"name": "Charlie Faber", "position": "Treasurer"},
					{"name": "Kenneth Adams", "position": "Senator"}],
		"text": "Blah blah string la de dah",
		"passed": true
    }, function(err, result) {
    	assert.equal(err, null);
    	console.log("Inserted a document into the restaurants collection.");
    	callback();
  	});
};

MongoClient.connect(url, function(err, db) {
  	assert.equal(null, err);
  	insertDocument(db, function() {
		db.close();
	});
});
*/
/*
MongoClient.connect(url, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} 
	else {
		//HURRAY!! We are connected. :)
		console.log('Connection established to', url);
		var myDate = new Date("2017-3-27");
		var result = 
		if(result) {
			console.log("The data was successfully stored");
		} else {
			console.log("Epic fail!");
		}
    	// Get the documents collection
		//Close connection
		db.close();
	}
});

app.use(express.static("./public"));

app.listen(3000,function() {
	console.log("Express app running on port 3000");
});

app.get("/", function(req, res) {
	res.sendFile("public/index.html");
});

module.exports = app;

*/

/*
http.createServer(function(req, res) {
	if(req.method === "GET") {
		res.writeHead(200, {"Content-Type": "text/html"});
		fs.createReadStream("./index.html","UTF-8").pipe(res);
	} else if(req.method === "POST") {
		var body = "";
		req.on("data", function(chunk) {
			body += chunk;
		});
		req.on("end", function() {
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end(`
				<!DOCTYPE html>
				<html>
					<head>
						<title>For Results</title>
					</head>
					<body>
						<h1>Your Form Results</h1>
						<p>${body}</p>
						<p>HELLO</p>
					</body>
				</html>
			`);
		});
	}
}).listen(3000);

console.log("Home server listening on port 3000");
*/