require('dotenv').config;
const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt,
  dbUser= require('../database/models/User'),
  dbConfig = require('../database/db-helpers');


module.exports = function (passport) {
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.LOCALSECRET
  }, async (payload, done) => {
    // console.log('this is payload id ', payload.id);
    // console.log('this is payload ', payload);
    try {
      const user = await dbUser.findById(payload.id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done (err, false);
    }
  }));
};
