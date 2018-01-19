const Sequelize = require('sequelize');
const sequelize = require('../database');

// define user_like
const UserLike = sequelize.define('user_like', {
  like: Sequelize.BOOLEAN
});

module.exports = UserLike;
