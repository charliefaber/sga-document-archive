var bcrypt = require('bcryptjs'),
    Q = require('q'),
    configDb = require('./database.js');

  var MongoClient = require('mongodb').MongoClient;

  exports.localAuth = function (username, password) {
  var deferred = Q.defer();

  MongoClient.connect(configDb.url, function (err, db) {
    var collection = db.collection('localUsers');

    collection.findOne({'username' : username})
      .then(function (result) {
        if (null == result) {
          console.log("USERNAME NOT FOUND:", username);

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

        db.close();
      });
  });

  return deferred.promise;
}