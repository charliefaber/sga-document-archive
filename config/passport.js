//load passport strategy
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var auth = require('auth.js');
//load user model
module.exports = function(auth, passport){
var passport = require('passport');
passport.use('local-signin', new LocalStrategy(
    //allows us to pass back the request to the callback
     function(req, username, password, done) {
       auth.localAuth(username, password)
       .then(function (user) {
         if (user) {
           console.log("LOGGED IN AS: " + user.username);
           req.session.success = 'You are successfully logged in ' + user.username + '!';
           done(null, user);
         }
         if (!user) {
           console.log("COULD NOT LOG IN");
           req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
           done(null, user);
         }
       })
       .fail(function (err){
         console.log(err.body);
       });
     }
   ));

passport.serializeUser(function(users, done) {
  console.log("serializing " + users.name);
  done(null, users);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});
};