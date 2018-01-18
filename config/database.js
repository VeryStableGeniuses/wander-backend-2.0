/**
 * Database configuration file
 * Set up schemas and table associations.
 * To connect to Postico, use the password below with the cloud_sql_proxy running
 */


require('dotenv').config();
const Sequelize = require('sequelize');

const pw = 'stablegenius';

// if (process.env.PROD) {
//   pw = 'stablegenius';
// }
// const sequelize = new Sequelize('wander', 'wander', pw, {
//   host: 'wander-app.c2xrfwg5wokn.us-east-2.rds.amazonaws.com',
//   dialect: 'postgres',
// });

const sequelize = new Sequelize('wander', 'wander', 'stablegenius', {
  host: 'wander-app.c2xrfwg5wokn.us-east-2.rds.amazonaws.com',
  port: 5432,
  logging: console.log,
  maxConcurrentQueries: 100,
  dialect: 'postgres',
  dialectOptions: {
    ssl: 'Amazon RDS'
  },
  pool: { maxConnections: 5, maxIdleTime: 30 },
  language: 'en'
});

// connect to db
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// define Type
const Type = sequelize.define('type', {
  name: Sequelize.STRING,
});

Type.sync();

// define user_like
const UserLike = sequelize.define('user_like', {
  like: Sequelize.BOOLEAN,
});

UserLike.sync();

UserLike.belongsTo(Type, { foreignKey: 'id_type' });
Type.hasMany(UserLike, { foreignKey: 'id_type' });

// define User
const User = sequelize.define('user', {
  name: Sequelize.STRING,
  password: Sequelize.STRING,
  email_address: Sequelize.STRING,
});

User.sync();

UserLike.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(UserLike, { foreignKey: 'id_user' });


// define Event
const Event = sequelize.define('event', {
  location: Sequelize.FLOAT,
  name: Sequelize.STRING,
});

Event.sync();

Event.belongsTo(Type, { foreignKey: 'id_type' });
Type.hasMany(Event, { foreignKey: 'id_type' });

// define event_schedule
const EventSchedule = sequelize.define('event_schedule', {
  dateTime: Sequelize.DATE,
});

EventSchedule.sync();

EventSchedule.belongsTo(Event, { foreignKey: 'id_event' });
Event.hasMany(EventSchedule, { foreignKey: 'id_event' });

// define Schedule
const Schedule = sequelize.define('schedule', {
  name: Sequelize.STRING,
});

Schedule.sync();

Schedule.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Schedule, { foreignKey: 'id_user' });

// define Photo
const Photo = sequelize.define('photo', {
  url: Sequelize.STRING,
});

Photo.sync();

Photo.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Photo, { foreignKey: 'id_user' });


// define Hometown
const Hometown = sequelize.define('hometown', {
  name: Sequelize.STRING,
});

Hometown.sync();

// define user_hometown
const UserHometown = sequelize.define('user_hometown', {
});

UserHometown.sync();

UserHometown.belongsTo(Hometown, { foreignKey: 'user_hometown' });
Hometown.hasMany(UserHometown, { foreignKey: 'user_hometown' });

UserHometown.belongsTo(User, { foreignKey: 'id_user' });
User.hasOne(UserHometown, { foreignKey: 'id_user' });

module.exports = {
  Type,
  User,
  UserLike,
  Event,
  EventSchedule,
  Schedule,
  Photo,
  Hometown,
  UserHometown,
  pw
};