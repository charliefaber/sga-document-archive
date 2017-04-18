//app/routes.js

module.exports = function(app, passport){

//
//HOME PAGE
//
app.get('/', function(req, res) {

    var search = req.body.searchText;

    db.collection('documents').find(
    ).sort({ date: -1}).limit(5).toArray(function(err, items) {
      res.render(path.join(__dirname, '/views/indexTest.handlebars'), { items: items });
    });
});


app.post('/search', function(req, res) {

  //fix DB CONNECTION
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

app.get('/download/:file(*)', function(req, res){
  var file = req.params.file
  var path = __dirname + "/uploads/" + file +".docx";

  res.download(path);
});

//
//UPLOAD
//c
app.get('/upload', function(req, res) {
  res.sendFile(path.join(__dirname, "views/upload.html"));
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

    //NEEDS TO BE FIXED WITH MONGOOSE
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


//
//LOGIN
//
app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, "./views/login.html"));
});

//process login
app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true
    })
);

//
//ADVANCED SEARCH PAGE
//
app.get('/advanced', function(req, res) {
  res.sendFile(path.join(__dirname, "views/advanced.html"));
});

//
//ADVANCED SEARCH CODE
//
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



}