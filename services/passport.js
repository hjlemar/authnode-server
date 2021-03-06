const passport = require('passport');
const User = require('../models/user');
const config =require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// create local Strategy
const  localLogin = new LocalStrategy(
    {usernameField: 'email'}
  , function (email, password, done){
    // verify this email and password, call done with user
    // if it ist he correct email and password
    User.findOne({ email: email },function(err, user){
      if(err) {return done (err); }

      if(!user){
        return done(null,false);
      }
      // compare passwords is password == user.password
      user.comparePassword(password,function(err,isMatch){
        if(err) { return done(err); }
        if(!isMatch){
          return done(null,false);
        } else {
          return done(null,user);
        }
      });
    });

  }
);

// Setup options for JWT stategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

// Create jwt Strategy
const jwtLogin = new JwtStrategy(jwtOptions,function(payload, done){
  // See if the user ID in the payload exists in our database.
  // if it does call done with that user.
  User.findById(payload.sub,function(err,user){
    if(err) {
      return done(err, false);
    }

    if(user){
      done(null,user);
    } else {
      // otherwise call done without a user object
      done(null,false);
    }
  });

});

// tell passport to use Strategy
passport.use(jwtLogin);
passport.use(localLogin);
