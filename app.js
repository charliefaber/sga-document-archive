// Server-side Operations

// Reference npm dependencies
var express = require('express');
var fileUpload = require('express-fileupload');
var textract = require('textract');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');

// MongoDB dependencies and variables
var mongo = require('mongodb');
var assert = require('assert');
var MongoClient = mongo.MongoClient;
var url = "mongodb://charliefaber:1234567890987654321@ds143340.mlab.com:43340/sgadb";

// Instantiate express variable
var app = express();

// Set up Node.js for express-fileupload and body-parser
app.use(fileUpload());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
 
  db.collection('documents').createIndex({text: "text"});
  db.close();
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.get('/results', function(req, res) {
  res.sendFile(path.join(__dirname, "views/results.html"));
});

app.get('/upload', function(req, res) {
  res.sendFile(path.join(__dirname, "views/upload.html"));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

app.get('/advanced', function(req, res) {
  res.sendFile(path.join(__dirname, "views/advanced.html"));
});

app.post('/search', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    var search = req.body.searchText;

    db.collection('documents').find(
      {$text: {$search: search}},
      {score: {$meta: "textScore"}}
    ).sort({ score: {$meta: "textScore"}}).toArray(function(err, items) {
    console.log(JSON.stringify(items));
            var p = path.join(__dirname, "/views/results.html");
    return res.sendFile(p);
    console.log(items[0].parse._id);
    console.log(json.path);
      document.getElementByID("addDiv").innerHTML = `   <div class="row no-gutter">
    <div class="col-md-2"></div>
    <div class="col-md-8">
      <h2></h2>
      <span style="font-size: 1.2em; font-style: italic;">Date: </span><br>
      <span style="font-weight: bold">To approve the appointment of Andrew Neiner as the Attorney General of the Student Government Association for the 2017-2018 session of the Student Government Association. </span><br><br>
      <p>WHEREAS, Justice Neiner has severed as a Justice on the Student Judicial Board from fall of 2015 to the present, serving during the previous two Student Government Association sessions; 

      WHEREAS, Justice Neiner has been present as a Student Justice in over 30 hearings and understands the hearing process as well as the role of the Attorney General in and throughout the hearing process; 

      WHEREAS, Justice Neiner has worked under Attorney General Shelby Weitzel and Mary Atkins from whom he learned how to handle Student Code of Conduct and Honor Code violations; 

      WHEREAS, Justice Neiner has a relationship with the Office of Student Affairs staff, most of whom also currently serve as advisors to the Student Government Association; 

      WHEREAS, Justice Neiner’s experience as an SGA Student Justice and work within Student Affairs employee has allowed him to work with and fully understand the Student Code of Conduct and Honor Code; 

      THEREFORE BE IT RESOLVED, that the Student Government Association of Georgia College formally approves the appointment of Andrew Neiner as the Attorney General of the Student Government Association for the 2017-2018 session of the Student Government Association
      </p><br>
    </div>
    <div class="col-md-2"></div>
  </div>`;
    });

    db.close();
  });
});


// POST for upload form submission
app.post('/upload', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  var myFile = req.files.myFile;
 
  var idText = req.body.idText;
  var filePath = path.join(__dirname,`/uploads/${idText}.docx`);

  doctypeSelect = req.body.doctypeSelect,
  dollarText = req.body.dollarText,
  dateSelect = req.body.dateSelect,
  tagText = req.body.tagText,
  bodyText = "";
  // Use the mv() method to place the file somewhere on your server 
  myFile.mv(filePath, function(err) {
    if (err)
      return res.status(500).send(err);
    
    textract.fromFileWithPath(filePath, function( error, text ) {
      bodyText = text;
      //console.log(text);
      //res.send(text);
      var p = path.join(__dirname, "views/results.html");
      res.redirect(p);
    });
    console.log(idText);
    console.log(doctypeSelect);
    console.log(dollarText);
    console.log(dateSelect);
    console.log(tagText);
    console.log(bodyText);
    console.log("");
    console.log(req.body);
    console.log(req.files);
  });

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    db.collection('documents').insertOne( {
      "_id": idText, 
      "path": filePath,
      "docType": doctypeSelect,
      "amount": dollarText,
      "date": dateSelect, 
      "tagline": tagText, 
      "text": bodyText});
    db.close();
  });
});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});


/*
//Error when run: cannot find module, './models/User'
//var User = require('../models/User');
var fs = require('fs');
var mongoose = require('mongoose');
var Gridfs = require('gridfs-stream');
mongoose.connect('mongodb://localhost/sgadb');
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
        console.log('success')
      });
      fs.unlink(req.files.file.path, function(err) {
        // handle error
        console.log('success!')
      });
   });
});
*/
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