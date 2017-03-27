/* jshint esnext: true */
var express = require('express');
var app = express();

app.use(function(req, res, next) {
	console.log(`${req.method} request for ${req.url}`);
	next();
});

app.use(express.static("./"));

app.listen(3000);

console.log("Express app runnig on port 3000");

module.exports = app;



/*
var http = require('http');
var fs = require('fs');

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