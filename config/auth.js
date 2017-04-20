var bcrypt = require('bcryptjs'),
    Q = require('q'),
    configDb = require('./database.js');

  var MongoClient = require('mongodb').MongoClient;
  exports.localAuth = function (req, username, password, done) {
  var deferred = Q.defer();

  MongoClient.connect(configDb.url, function (err, db) {
    var collection = db.collection('users');
    collection.find({'name' : username}).toArray(function(err, items) {
        var result=items[0];
        if (result==null) {
          console.log("USERNAME NOT FOUND:", username);
            console.log(password);
          deferred.resolve(false);
        }
        else {
          var hash = result.password;

          console.log("FOUND USER: " + result.username);

          if (bcrypt.compareSync(password, hash)) {
            deferred.resolve(result);
          } else {
            console.log("AUTHENTICATION FAILED");
            deferred.resolve(false);
          }
        }
       });
        db.close();
      });

  return deferred.promise;
}
