// Server-side Operations

// Reference npm dependencies
var express = require('express');
var fileUpload = require('express-fileupload');
var exphbs = require('express-handlebars');
var textract = require('textract');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var jsonQuery = require('json-query');


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
app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


passport.use(new LocalStrategy(
  function(username, password, done) {
    users.findOne({ username: username }, function(err, user) {
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
  var search = req.body.advText;

  var radio1 = "";
  var radio2 = "";
  if(req.body.radio == 'on') {radio1 = "checked"; radio2="";}
  else {radio1=""; radio2 = "checked";}

  var check1 = "";
  if(req.body.check1 == 'on') {check1 = "checked";}
  var check2 = "";
  if(req.body.check2 == 'on') {check2 = "checked";}

  var yearMin = req.body.yearMin;
  var yearMax = req.body.yearMax;

  var amtMin = req.body.amtMin;
  var amtMax = req.body.amtMax;
  var buttonVals = {searchVal: search, radioVal1: radio1, radioVal2: radio2, checkVal1: check1, checkVal2: check2, yearMinVal: yearMin, yearMaxVal: yearMax, amtMinVal: amtMin, amtMaxVal: amtMax};
  
  var results = [];
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);

    if(radio1 == "checked") {
      db.collection('documents').find(
      {$tagline: {$search: search}},
      {score: {$meta: "textScore"}}
      ).sort({ score: {$meta: "textScore"}}).toArray(function(err, items) {
    
      results = items;
      console.log(JSON.stringify(items));
      res.render(path.join(__dirname, '/views/resultsTest.handlebars'), {search: search, items: items, buttonVals: buttonVals});

    });
    }
    else {
    db.collection('documents').find(
      {$text: {$search: search}},
      {score: {$meta: "textScore"}}
    ).sort({ score: {$meta: "textScore"}}).toArray(function(err, items) {
      results = items;

      console.log(JSON.stringify(items));
      res.render(path.join(__dirname, '/views/resultsTest.handlebars'), {search: search, items: items, buttonVals: buttonVals});
  
    });
    }

    if(check1 == "checked" && check2 =="checked") {

    }
    else if(check1 = "checked") {
    }
    else if(check2 = "checked") {
    }
    
    db.close();
  });


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
  var sContain = myFile.includes(".docx");
  if(sContain){
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
    });}
  else
    return res.status(400).send('No Files were uploaded.');

});

5
app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

passport.use(new LocalStrategy(
  function(username, password, done) {
    users.findOne({ username: username }, function(err, user) {
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


var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});

