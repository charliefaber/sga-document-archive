//load passport strategy
var LocalStrategy = require('passport-local').Strategy;

//load user model
var User = require('../app/models/users.js');

module.exports = function(passport){

    passport.serializeUser(function(users, done){
        done(null, users._id);
    });

    passport.deserializeUser(function(_id,done){
        User.findById(id, function(err, users){
            done(err,users);
        });
    });

    passport.use('local-login', new LocalStrategy({
            usernameField : '_id',
            passwordField: 'password',
            passReqToCallback : true
        },
        function(req, _id, password, done){

            User.findOne({'local._id' : id}, function(err, users){

                if(err)
                    return done(err);

                if(!users)
                    return done(null, false, req.flash('loginMessage', 'No user found.'))

                if(!users.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Wrong password'))

                return done(null, users);
            });
     }));
};