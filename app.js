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
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require = require('connect-flash');

// Instantiate express variable
var app = express();
var hbs = exphbs.create({
  helpers: {
    inc: function(num) {return num+1;}
  }
});

var morgan = require('morgan');
var cookieParser = require('cookie_parser')
var bodyParser = require('body-parser');
var session = require('express-session');

var configDB = require('./config/database.js');

var mongodb = require('mongodb');
var assert = require('assert');
//var MongoClient = mongo.MongoClient;

mongoose.connect(configDB.url);

require('./config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());


//for passport
app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//routers
require('./app/routes.js')(app, passport);
require('./config/passport')(passport);

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(fileUpload());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

//launch
var server = app.listen(port, function(){
  console.log('Server listening on port 3000');
});