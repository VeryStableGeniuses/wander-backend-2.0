require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize('wander', 'root', {
  host: process.env.PORT,
  dialect: 'Postgresql',
});

const Type = sequelize.define('type', {
  name: Sequelize.STRING,
});

const user_like = sequelize.define('user_like', {
  like: Sequelize.STRING,
  dislike: Sequelize.STRING,
});

user_like.belongsTo(Type, { foreignKey: 'id_Type' });
Type.hasMany(user_like, { foreignKey: 'id_Type' });

const User = sequelize.define('user', {
  name: Sequelize.STRING,
  password: Sequelize.STRING,
  email_address: Sequelize.STRING,
});

user_like.belongsTo(User, { foreignKey: 'id_User' });
User.hasMany(user_like, { foreignKey: 'id_user' });

const Event = sequelize.define('event', {
  location: Sequelize.FLOAT,
  name: Sequelize.STRING,
});

Event.belongsTo(Type, { foreignKey: 'id_Type' });
Type.hasMany(Event, { foreignKey: 'id_Type' });

const event_schedule = sequelize.define('event_schedule', {
  dateTime: Sequelize.TIME,
});

event_schedule.belongsTo(Event, { foreignKey: 'id_Event' });
Event.hasMany(event_schedule, { foreignKey: 'id_Event' });

const Schedule = sequelize.define('schedule', {
  name: Sequelize.STRING,
});

Schedule.belongsTo(User, { foreignKey: 'id_User' });
User.hasMany(Schedule, { foreignKey: 'id_User' });

const Photo = sequelize.define('photo', {
  url: Sequelize.STRING,
});

Photo.belongsTo(User, { foreignKey: 'id_User' });
User.hasMany(Photo, { foreignKey: 'id_User'});

const Hometown = sequelize.define('hometown', {
  name: Sequelize.STRING,
});

const user_hometown = sequelize.define('user_hometown', {
});

user_hometown.belongsTo(Hometown, { foreignKey: 'user_Hometown'});
Hometown.hasMany(user_hometown, { foreignKey: 'user_Hometown'});

user_hometown.belongsTo(User, { foreignKey: 'id_User' });
User.hasOne(user_hometown, { foreignKey: 'id_User'});

Type.sync();
User.sync();
user_like.sync();
Event.sync();
event_schedule.sync();
Schedule.sync();
Photo.sync();
Hometown.sync();
user_hometown.sync();

module.exports = {
  Type,
  User,
  user_like,
  Event,
  event_schedule,
  Schedule,
  Photo,
  Hometown,
  user_hometown,
};





