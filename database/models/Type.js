const Sequelize = require('sequelize');
const sequelize = require('../database');

// define Type
const Type = sequelize.define('type', {
  name: Sequelize.STRING
});

module.exports = Type;
