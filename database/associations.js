const sequelize = require('./database');

const {
  Type,
  User,
  UserLike,
  Event,
  EventSchedule,
  Schedule,
  Photo,
  Hometown,
  UserHometown
} = require('./models/exports');

UserLike.belongsTo(Type, { foreignKey: 'id_type' });
Type.hasMany(UserLike, { foreignKey: 'id_type' });

UserLike.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(UserLike, { foreignKey: 'id_user' });

Event.belongsTo(Type, { foreignKey: 'id_type' });
Type.hasMany(Event, { foreignKey: 'id_type' });

EventSchedule.belongsTo(Event, { foreignKey: 'id_event' });
Event.hasMany(EventSchedule, { foreignKey: 'id_event' });

Schedule.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Schedule, { foreignKey: 'id_user' });

Photo.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Photo, { foreignKey: 'id_user' });

UserHometown.belongsTo(Hometown, { foreignKey: 'user_hometown' });
Hometown.hasMany(UserHometown, { foreignKey: 'user_hometown' });

UserHometown.belongsTo(User, { foreignKey: 'id_user' });
User.hasOne(UserHometown, { foreignKey: 'id_user' });

sequelize.sync();