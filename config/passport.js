//load passport strategy
var LocalStrategy = require('passport-local').Stragey;

//load user model
var User = require('../app/models/user');

modeule.exports = function(passport){

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id,done){
        User.findById(id, function(err, user)){
            done(err,user);
        });
    });

    passport.use('local-login',
        new LocalStrategy({
            usernameField : 'id',
            passwordField: 'password',
            passReqToCallback : true
        },
        function(req, id, password, done){

            User.findOne({'local.id' : id}, function(err, user){

                if(err)
                    return done(err);function

                if(!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'))

                if(!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Wrong password'))

                return done(null, user);
            });
     }));
};