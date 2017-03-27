var http = require('http');
var fs = require('fs');

var express = require('express');
var app = express();

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/sgadb";

MongoClient.connect(url, function (err, db) {
	if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
	} 
	else {
		//HURRAY!! We are connected. :)
		console.log('Connection established to', url);
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