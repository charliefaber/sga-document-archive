// Server-side Operations

// Reference npm dependencies
var express = require('express');
var fileUpload = require('express-fileupload');
var exphbs = require('express-handlebars');
var textract = require('textract');
var path = require('path');
var fs = require('fs');
var jsonQuery = require('json-query');
var methodOverride = require('method-override');

var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

// MongoDB dependencies and variables
var mongo = require('mongodb');
var assert = require('assert');
var MongoClient = mongo.MongoClient;
var configDb = require('./config/database.js');


// Instantiate express variable
var app = express();
var hbs = exphbs.create({
  helpers: {
    defaultLayout: 'main',
    inc: function(num) {return num+1;},
    inc: function(num) {return num+1;},
    if1: function(num) {return num == 1;}
  }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

mongoose.connect(configDb.url);
require('./config/passport.js')(passport);

app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat',
                  resave: true,
                  saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});
app.use(fileUpload());
app.use(express.static(__dirname));

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//routers
require('./config/passport.js')(passport);
require('./app/routes.js')(app, passport);



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
