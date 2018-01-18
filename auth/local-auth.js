require('dotenv').config;
const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt,
  db = require('../config/database'),
  dbConfig = require('../config/db-helpers');

module.exports = function (passport) {

  var opts = {};
  
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = db.pw;
  // opts.issuer = 'accounts.examplesoft.com';
  // opts.audience = 'yoursite.net';
  
  
  passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    dbConfig.getUserById(jwt_payload._doc._id, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    });
  }));
};
