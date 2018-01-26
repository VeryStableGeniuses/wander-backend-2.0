require('dotenv').config;
const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt,
  dbUser= require('../database/models/User');


module.exports = function (passport) {
  // JSON Web Token strategy
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.LOCALSECRET
  }, (payload, done) => {
    // console.log('this is payload id ', payload.id);
    // console.log('this is payload ', payload);
    
    dbUser.findById(payload.id)
      .then((user) => {
        if (!user) {
          return done(null, false);
        }
        done(null, user.dataValues);
      })
      .catch((err) => {
        console.error('database findByID error ', err);
        done(err);
      });
    
  }));
};
