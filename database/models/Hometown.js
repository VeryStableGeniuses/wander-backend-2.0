const Sequelize = require('sequelize');
const sequelize = require('../database');

// define Hometown
const Hometown = sequelize.define('hometown', {
  name: Sequelize.STRING
});

module.exports = Hometown;