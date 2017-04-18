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
    inc: function(num) {return num+1;},
    if1: function(num) {return num == 1;}
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

// ----- POST Methods -----

// Simple search form query
app.post('/search', function(req, res) {
  // Initialize variables
  var search = req.body.searchText;         // 
  var filter = req.body.filterSelect;       // Selected filter value
  var relevancy = false, recency = false, highest = false, lowest = false;

  if(filter == null || filter == undefined || filter == "" || filter == "relevancy") {
    relevancy = true;
  }
  else if(filter == "recency") {
    recency = true;
  }
  else if(filter == "highest") {
    highest = true;
  }
  else {
    lowest = true;
  }    



  var buttonVals = {filter: filter, relevancy: relevancy, recency: recency, highest: highest, lowest: lowest};

  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);


    db.collection('documents').find(
      {$text: {$search: search}},
      {score: {$meta: "textScore"}}
    ).sort({ score: {$meta: "textScore"}}).toArray(function(err, items) {
      console.log(JSON.stringify(items));

      if(filter == "recency") {
        items.sort(function(a, b) {
          console.log(new Date(a.date));
          console.log(new Date(b.date));

          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
          //res.render(path.join(__dirname, '/views/resultsTest.handlebars'), {search: search, buttonVals: buttonVals, results: results});
        console.log("2");
      }
      else if(filter == "highest") {
        items.sort(function(a, b) {
          return b.amount - a.amount;
        });
          //res.render(path.join(__dirname, '/views/resultsTest.handlebars'), {search: search, buttonVals: buttonVals, results: results});
        console.log("3");
      }
      else if(filter == "lowest") {
        items.sort(function(a, b) {
          return a.amount - b.amount;
        });
        console.log("4");
      }
      else {
        console.log("1")
      }
      res.render(path.join(__dirname, '/views/resultsTest.handlebars'), {search: search, buttonVals: buttonVals, results: items });

    });
    //console.log(JSON.stringify(results));
    db.close();
  });

});

// Handles submission of advanced search form
app.post('/advancedSearch', function(req, res) {

// Initialize variables with values from form fields
  var search = req.body.advText;                        // Search String
  var filter = req.body.advFilterSelect;                // Selected value of filter dropdown
  var relevancy = false, recency = false, highest = false, lowest = false;
  // Store the value of each filter option in respective boolean variables
  if(filter == null || filter == undefined || filter == "" || filter == "relevancy") 
     relevancy = true;
  else if(filter == "recency") 
    recency = true;
  else if(filter == "highest") 
    highest = true;
  else 
    lowest = true;

  // Document Type Checkboxes
  var billCheck = "";               // Bill
  var resCheck = "";                // Resolution
  // If value of Checkbox is 'on', box is checked, therefore store "checked" in respective variable
  if(req.body.billCheck == 'on') {billCheck = "checked";} 
  if(req.body.resCheck == 'on') {resCheck = "checked";}
  
  // Year Range
  var yearMin = req.body.yearMin;  
  var yearMax = req.body.yearMax;
  // If min or max not provided, assign default year range of 0 to 3000 
  if(yearMin == null || yearMin == undefined || yearMin == "") 
    yearMin = 0;
  if(yearMax == null || yearMax == undefined || yearMax == "") 
    yearMax = 3000;

  // Amount Range
  var amtMin = req.body.amtMin;
  var amtMax = req.body.amtMax;
  // If min or max not provided, assign default amount range of 0 to 100000 
  if(amtMin == null || amtMin == undefined || amtMin == "") 
    amtMin = 0;
  if(amtMax == null || amtMax == undefined || amtMax == "") 
    amtMax = 100000;
  
  // Store values of buttons in JavaScript object
  var buttonVals = {filter: filter, relevancy: relevancy, recency: recency, highest: highest, lowest: lowest};

// Connect to Mongo database
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);        // Check for errors

    // Query documents collection
    db.collection('documents').find(
      {$text: {$search: search}},             // User's text passed in search variable
      {score: {$meta: "textScore"}}           // Sort documents by score of match
    ).sort({ score: {$meta: "textScore"}}).toArray(function(err, items) { // Convert to array
      
      // Filter the array based on the advanced form fields
      items = items.filter(function(item) {
        // Get year of current document being filtered
        var year = new Date(item.date).getFullYear();

        // If both bill and resolution are checked
        if(billCheck == "checked" && resCheck == "checked") 
          return(year >= yearMin && year <= yearMax && item.amount >= amtMin && item.amount <= amtMax)
        // Else if only bill is checked
        else if(billCheck == "checked") 
          return(item.docType == "bill" && year >= yearMin && year <= yearMax && item.amount >= amtMin && item.amount <= amtMax);
        // Else if only resolution is checked
        else if(resCheck == "checked") {
          return(item.docType == "res" && year >= yearMin && year <= yearMax && item.amount >= amtMin && item.amount <= amtMax);
        }
      });

      // Use value of filter to determine how to sort results
      if(filter == "recency") {       
        // Sort based on recency of date           
        items.sort(function(a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      }
      else if(filter == "highest") {
        // Sort based on amount of document, highest first
        items.sort(function(a, b) {
          return b.amount - a.amount;
        });
      }
      else if(filter == "lowest") {
        // Sort based on amount of document, lowest first
        items.sort(function(a, b) {
          return a.amount - b.amount;
        });
      }

      // Render results handlebars template, passing variables containing search, button values, and sorted results
      res.render(path.join(__dirname, '/views/resultsTest.handlebars'), {search: search, buttonVals: buttonVals, results: items});
    });
    db.close();
  });
});



app.get('/download/:file(*)', function(req, res){
  var file = req.params.file
  var path = __dirname + "/uploads/" + file +".docx";

  res.download(path);
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

