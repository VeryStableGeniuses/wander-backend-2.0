const Sequelize = require('sequelize');
const sequelize = require('../database');

// define user_schedule
const UserSchedule = sequelize.define('user_schedule', {
  status: Sequelize.STRING
});

module.exports = UserSchedule;
