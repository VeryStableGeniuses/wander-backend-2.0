/**
 * Database helper file
 * Create methods to interact with database.
 */

const {
  Type,
  User,
  UserLike,
  Event,
  EventSchedule,
  Schedule,
  Photo,
  Hometown,
  UserHometown,
} = require('./database');


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

  getUsers: callback => {
    User.findAll()
      .then(users => {
        callback(null, users);
      })
      .catch(err => {
        callback(err);
      });
  },

  getUserLikes: (user, callback) => {
    User.findById(user.id)
      .then(user => {
        return user.getUserLikes();
      })
      .then(userLike => {
        callback(null, userLike);
      })
      .catch(err => {
        callback(err);
      });
  },

  updateUserLikes: (userLike, callback) => {
    UserLike.findById(userLike.id).then(found => {
      return found
        .update(userLike, { fields: ['id_type', 'id_user', 'like', 'dislike'] })
        .save();
    })
      .then(updatedUserLike => {
        callback(null, updatedUserLike);
      })
      .catch(err => {
        callback(err);
      });
  },

  getEvents: callback => {
    Event.findAll()
      .then(events => {
        callback(null, events);
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
    EventSchedule
      .findById(eventSchedule.id)
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

  getUserSchedule: (user, callback) => {
    User.findById(user.id)
      .then(user => {
        return user.getUserSchedule();
      })
      .then(schedule => {
        Schedule.findById(schedule.id);
      })
      .then(schedule => {
        return schedule.getUserSchedule();
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

/** TODO:
 * get each row from a table by id (get user by id, etc.)
 * CRUD for each table (delete user, update user by id, get user by id, etc.)
 * 
 */

