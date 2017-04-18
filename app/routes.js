//app/routes.js

module.exports = function(app, passport){

//HOME PAGE
app.get('/', function(req, res) {

    var search = req.body.searchText;

    db.collection('documents').find(
    ).sort({ date: -1}).limit(5).toArray(function(err, items) {
      res.render(path.join(__dirname, '/views/indexTest.handlebars'), { items: items });
    });
  });
});

//UPLOAD
app.get('/upload', function(req, res) {
  res.sendFile(path.join(__dirname, "views/upload.html"));
});

//LOGIN
app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, "views/login.html"));
});

//ADVANCED SEARCH PAGE
app.get('/advanced', function(req, res) {
  res.sendFile(path.join(__dirname, "views/advanced.html"));
});


}