require('dotenv').config;
const JwtStrategy = require('passport-jwt').Strategy,
  LocalStrategy = require('passport-local').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt,
  dbUser= require('../database/models/User'),
  dbConfig = require('../database/db-helpers');


module.exports = function (passport) {
  // JSON Web Token strategy
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.LOCALSECRET
  }, (payload, done) => {
    // console.log('this is payload id ', payload.id);
    // console.log('this is payload ', payload);
    try {
      const user = dbUser.findById(payload.id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done (err, false);
    }
  }));
  //Local Strategy
  passport.use(new Strategy({
    usernameField: 'email',
  }, (email, password, done) => {
    const user = dbUser.findOne({ email });
    if (!user) {
      return done(null, false);
    }
  }));
};
