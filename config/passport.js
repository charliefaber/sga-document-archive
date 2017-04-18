//load passport strategy
var LocalStrategy = require('passport-local').Strategy;

//load user model
var User = require('../app/models/users');

module.exports = function(passport){

    passport.serializeUser(function(user, done){
        done(null, users.id);
    });

    passport.deserializeUser(function(id,done){
        User.findById(id, function(err, users){
            done(err,users);
        });
    });

    passport.use('local-login', new LocalStrategy({
            usernameField : 'id',
            passwordField: 'password',
            passReqToCallback : true
        },
        function(req, id, password, done){

            User.findOne({'local.id' : id}, function(err, users){

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