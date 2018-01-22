/**
 * Database helper file
 * Create methods to interact with database.
 */

const bcrypt = require('bcrypt-nodejs');

const sequelize = require('./database'),
  associations = require('./associations');

// const scheduleBuilder = require('../scheduleBuilder');

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

module.exports = {
  getTypes: callback => {
    Type.findAll()
      .then(types => {
        callback(null, types);
      })
      .catch(err => {
        callback(err);
      });
  },

  addType: (type, callback) => {
    Type.create(type, { fields: ['name'] })
      .then(type => {
        callback(null, type);
      })
      .catch(err => {
        callback(err);
      });
  },

  getUsers: callback => {
    User.findAll()
      .then(users => {
        callback(null, users);
      })
      .catch(err => {
        callback(err);
      });
  },

  createUser: (newUser, callback) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, null, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        User.create(newUser, { fields: ['name', 'password', 'email_address'] })
          .then(user => {
            callback(null, user);
          })
          .catch(err => {
            callback(err);
          });
      });
    });
  },

  comparePassword: (password, hash, callback) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) throw err;
      callback(null, isMatch);
    });
  },

  getUserById: (user, callback) => {
    User.findById(user.id)
      .then(user => {
        callback(null, user);
      })
      .catch(err => {
        callback(err);
      });
  },

  getuserByEmail: (email, callback) => {
    User.findOne({
      where: { email_address: email }
    })
      .then(user => {
        callback(null, user);
      })
      .catch(err => {
        callback(err);
      });
  },

  updateUser: (user, callback) => {
    User.findById(user.id)
      .then(found => {
        return found
          .update(user, { fields: ['username', 'password', 'email_address'] })
          .save();
      })
      .then(updatedUser => {
        callback(null, updatedUser);
      })
      .catch(err => {
        callback(err);
      });
  },

  deleteUser: (user, callback) => {
    User.findById(user.id)
      .then(found => {
        return found.destroy().save();
      })
      .then(() => {
        callback(null);
      })
      .catch(err => {
        callback(err);
      });
  },

  getUserLikes: (userId, callback) => {
    UserLike.findAll({ where: { id_user: userId } })
      .then(userLikes => {
        callback(null, userLikes);
      })
      .catch(err => {
        callback(err);
      });
  },

  addUserLike: (userLike, callback) => {
    console.log('user like', userLike);
    UserLike.create(userLike, { fields: ['id_type', 'id_user', 'like'] })
      .then(userLike => {
        callback(null, userLike);
      })
      .catch(err => {
        callback(err);
      });
  },

  updateUserLikes: (userLike, callback) => {
    UserLike.findById(userLike.id)
      .then(found => {
        return found
          .update(userLike, { fields: ['id_type', 'id_user', 'like'] })
          .save();
      })
      .then(updatedUserLike => {
        callback(null, updatedUserLike);
      })
      .catch(err => {
        callback(err);
      });
  },

  // deleteUserLikes

  getEvents: callback => {
    Event.findAll()
      .then(events => {
        callback(null, events);
      })
      .catch(err => {
        callback(err);
      });
  },

  getEventById: (event, callback) => {
    Event.findById(event.id)
      .then(event => {
        callback(null, event);
      })
      .catch(err => {
        callback(err);
      });
  },

  addEvent: (event, callback) => {
    Event.create(event, { fields: ['id_type', 'location', 'name'] })
      .then(event => {
        callback(null, event);
      })
      .catch(err => {
        callback(err);
      });
  },

  updateEvents: (event, callback) => {
    Event.findById(event.id)
      .then(found => {
        return found
          .update(event, { fields: ['location', 'name', 'id_type'] })
          .save();
      })
      .then(updatedEvent => {
        callback(null, updatedEvent);
      })
      .catch(err => {
        callback(err);
      });
  },

  deleteEvent: (event, callback) => {
    Event.findById(event.id)
      .then(found => {
        return found.destroy().save();
      })
      .then(() => {
        callback(null);
      })
      .catch(err => {
        callback(err);
      });
  },

  getEventTypes: (type, callback) => {
    Type.findById(type.id)
      .then(type => {
        return type.getEventTypes();
      })
      .then(event => {
        callback(null, event);
      })
      .catch(err => {
        callback(err);
      });
  },

  getSchedules: callback => {
    Schedule.findAll()
      .then(schedule => {
        callback(null, schedule);
      })
      .catch(err => {
        callback(err);
      });
  },

  // updateSchedule
  // deleteSchedule

  getScheduleById: (schedule, callback) => {
    Schedule.findById(schedule.id)
      .then(schedule => {
        callback(null, schedule);
      })
      .catch(err => {
        callback(err);
      });
  },

  getEventSchedule: (event, callback) => {
    Event.findById(event.id)
      .then(event => {
        return event.getEventSchedule();
      })
      .then(schedule => {
        Schedule.findById(schedule.id);
      })
      .then(schedule => {
        return schedule.getEventSchedule();
      })
      .catch(err => {
        callback(err);
      });
  },

  updateEventSchedule: (eventSchedule, callback) => {
    EventSchedule.findById(eventSchedule.id)
      .then(found => {
        return found
          .update(eventSchedule, {
            fields: ['id_event', 'id_schedule', 'dateTime']
          })
          .save();
      })
      .then(updatedEventSchedule => {
        callback(null, updatedEventSchedule);
      })
      .catch(err => {
        callback(err);
      });
  },

  deletescheduledEvent: (event, callback) => {
    EventSchedule.findById(event.id)
      .then(found => {
        return found.destroy().save();
      })
      .then(() => {
        callback(null);
      })
      .catch(err => {
        callback(err);
      });
  },

  // app.get('/schedules')
  getSchedulesForUser: (uid, callback) => {
    Schedule.findAll({ where: { id_user: uid } })
      .then(schedules => {
        callback(null, schedules);
      })
      .catch(err => {
        callback(err);
      });
  },

  // createSchedule: (schedule, callback) => {
  //   Schedule.create(schedule, { fields: ['name'] })
  //     .then(schedule => {
  //       callback(null, schedule);
  //     })
  //     .catch(err => {
  //       callback(err);
  //     });
  // },

  addEventSchedule: (event, callback) => {
    EventSchedule.create(event, { fields: ['name', 'id_event', 'id_schedule'] })
      .then(schedule => {
        callback(null, schedule);
      })
      .catch(err => {
        callback(err);
      });
  },

  createSchedule: (schedule, addEventSchedule, callback) => {
    Schedule.create(schedule, { fields: ['name', 'id_user'] })
      .then(schedule => {
        addEventSchedule(null, schedule);
      })
      .catch(err => {
        callback(err);
      });
  },

  getEventsForSchedule: (sid, callback) => {
    EventSchedule.findAll({ where: { id_schedule: sid } })
      // EventSchedule.findAll()
      .then(events => {
        callback(null, events);
      })
      .catch(err => {
        callback(err);
      });
  },

  getPhotos: callback => {
    Photo.findAll()
      .then(photos => {
        callback(null, photos);
      })
      .catch(err => {
        callback(err);
      });
  },

  getPhotoById: (photo, callback) => {
    Photo.findById(photo.id)
      .then(photo => {
        callback(null, photo);
      })
      .catch(err => {
        callback(err);
      });
  },

  addPhoto: (photo, callback) => {
    Photo.create(photo, { fields: ['url'] })
      .then(photo => {
        callback(null, photo);
      })
      .catch(err => {
        callback(err);
      });
  },

  updatePhoto: (photo, callback) => {
    Photo.findById(photo.id)
      .then(found => {
        return found.update(photo, { fields: ['url', 'id_user'] }).save();
      })
      .then(updatedPhoto => {
        callback(null, updatedPhoto);
      })
      .catch(err => {
        callback(err);
      });
  },

  getUserPhotos: (user, callback) => {
    User.findById(user.id)
      .then(user => {
        return user.getUserPhotos();
      })
      .then(photo => {
        callback(null, photo);
      })
      .catch(err => {
        callback(err);
      });
  },

  getHometowns: callback => {
    Hometown.findAll()
      .then(hometowns => {
        callback(null, hometowns);
      })
      .catch(err => {
        callback(err);
      });
  },

  getUserHometowns: callback => {
    UserHometown.findAll()
      .then(userHometowns => {
        callback(null, userHometowns);
      })
      .catch(err => {
        callback(err);
      });
  },

  getUserHometown: (user, callback) => {
    User.findById(user.id)
      .then(user => {
        return user.getUserHometown();
      })
      .then(hometown => {
        callback(null, hometown);
      })
      .catch(err => {
        callback(err);
      });
  }
};
