const Sequelize = require('sequelize');
const sequelize = require('../database');

// define user_hometown
const UserHometown = sequelize.define('user_hometown', {});

module.exports = UserHometown;