// Server-side Operations

// Reference npm dependencies
var express = require('express');
var fileUpload = require('express-fileupload');
var exphbs = require('express-handlebars');
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
var hbs = exphbs.create({ 
  helpers: {
    inc: function(num) {return num+1;} 
  }
});

//configure passport
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

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
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    var search = req.body.searchText;

    db.collection('documents').find(
    ).sort({ date: -1}).limit(5).toArray(function(err, items) {
      res.render(path.join(__dirname, '/views/indexTest.handlebars'), { items: items });
    });
  });
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

app.post('/advancedSearch', function(req, res) {
  var search = req.body.searchText;
  
  var radio1 = req.body.radio1;
  var radio2 = req.body.radio2;

  var check1 = req.body.check1;
  var check2 = req.body.check2;
  var yearMin = req.body.yearMin;
  var yearMax = req.body.yearMax;
  var amtMin = req.body.amtMin;
  var amtMax = req.body.amtMax;

  console.log(search);
  console.log(radio1);
  console.log(radio2);
  console.log(check1);
  console.log(check2);
  console.log(yearMin);
  console.log(yearMax);
  console.log(amtMin);
  console.log(amtMax);


});

app.get('/download/:file(*)', function(req, res){
  var file = req.params.file
  var path = __dirname + "/uploads/" + file +".docx";

  res.download(path);
});


app.post('/search', function(req, res) {
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    var search = req.body.searchText;

    db.collection('documents').find(
      {$text: {$search: search}},
      {score: {$meta: "textScore"}}
    ).sort({ score: {$meta: "textScore"}}).toArray(function(err, items) {

      res.render(path.join(__dirname, '/views/resultsTest.handlebars'), {search: search, items: items });

      console.log(JSON.stringify(items));
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

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});

