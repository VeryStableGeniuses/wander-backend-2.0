// const Sequelize = require('sequelize');
// const sequelize = require('../database');

// // define Event
// const Event = sequelize.define('event', {
//   location: Sequelize.STRING,
//   name: Sequelize.STRING,
//   googleId: Sequelize.STRING
// });

// module.exports = Event;

const Sequelize = require('sequelize');
const sequelize = require('../database');

// define Event
const Event = sequelize.define('event', {
  name: Sequelize.STRING,
  latitude: Sequelize.FLOAT,
  longitude: Sequelize.FLOAT,
  startTime: Sequelize.INTEGER,
  googleId: Sequelize.STRING
});

module.exports = Event;
