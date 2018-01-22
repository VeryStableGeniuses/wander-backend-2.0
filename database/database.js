/**
 * Database configuration file
 * Set up schemas and table associations.
 */

require('dotenv').config();
const Sequelize = require('sequelize');

let pw = 'stablegenius';

if (process.env.PROD) {
  pw = 'stablegenius';
}

const sequelize = new Sequelize('wander', 'wander', pw, {
  host: 'wander-app.c2xrfwg5wokn.us-east-2.rds.amazonaws.com',
  // host: '127.0.0.1',
  dialect: 'postgres',
  logging: console.log,
});

// const sequelize = new Sequelize('wander', 'wander', 'stablegenius', {
//   host: 'wander-app.c2xrfwg5wokn.us-east-2.rds.amazonaws.com',
//   port: 5432,
//   logging: console.log,
//   maxConcurrentQueries: 100,
//   dialect: 'postgres',
//   dialectOptions: {
//     ssl:'Amazon RDS'
//   },
//   pool: { maxConnections: 5, maxIdleTime: 30},
//   language: 'en'
// });

// connect to db
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;