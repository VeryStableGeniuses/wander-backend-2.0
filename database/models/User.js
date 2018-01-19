const Sequelize = require('sequelize');
const sequelize = require('../database');

// define User
const User = sequelize.define('user', {
  name: Sequelize.STRING,
  password: Sequelize.STRING,
  email_address: Sequelize.STRING
});

module.exports = User;
