const Sequelize = require('sequelize');
const sequelize = require('../database');

// define Photo
const Photo = sequelize.define('photo', {
  url: Sequelize.STRING
});

module.exports = Photo;
