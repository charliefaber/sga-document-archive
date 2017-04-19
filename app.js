// Server-side Operations

// Reference npm dependencies
var express = require('express');
var fileUpload = require('express-fileupload');
var exphbs = require('express-handlebars');
var textract = require('textract');
var path = require('path');
var fs = require('fs');
var jsonQuery = require('json-query');

var port = process.env.PORT || 3000;
//var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

// MongoDB dependencies and variables
var mongo = require('mongodb');
var assert = require('assert');
var MongoClient = mongo.MongoClient;
var configDB = require('./config/database.js');


// Instantiate express variable
var app = express();
var hbs = exphbs.create({
  helpers: {

    inc: function(num) {return num+1;},
    inc: function(num) {return num+1;},
    if1: function(num) {return num == 1;}
  }
});

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


require('./config/passport.js')(passport);

app.use(morgan('dev'));
app.use(cookieParser());

//for passport
app.use(session({ secret: 'keyboard cat',
                  resave: true,
                  saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(fileUpload());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//routers
require('./app/routes.js')(app, passport);
require('./config/passport')(passport);


//launch
/*
var server = app.listen(port, function(){
MongoClient.connect(configDB.url, function(err, db) {
  assert.equal(null, err);
 
  db.collection('documents').createIndex({text: "text"});
  db.close();
});
});
*/


var server = app.listen(port, function(){

  console.log('Server listening on port 3000');
});
