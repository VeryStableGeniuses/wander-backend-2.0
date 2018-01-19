const Sequelize = require('sequelize');
const sequelize = require('../database');

// define Schedule
const Schedule = sequelize.define('schedule', {
  name: Sequelize.STRING
});

module.exports = Schedule;
