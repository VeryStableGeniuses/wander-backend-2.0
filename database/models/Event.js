const Sequelize = require('sequelize');
const sequelize = require('../database');

// define Event
const Event = sequelize.define('event', {
  location: Sequelize.FLOAT,
  name: Sequelize.STRING
});

module.exports = Event;