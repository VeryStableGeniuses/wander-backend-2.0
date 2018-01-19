const Sequelize = require('sequelize');
const sequelize = require('../database');

// define event_schedule
const EventSchedule = sequelize.define('event_schedule', {
  dateTime: Sequelize.DATE
});


module.exports = EventSchedule;