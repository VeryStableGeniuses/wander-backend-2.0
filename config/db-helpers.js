const {
  Type,
  User,
  user_like,
  Event,
  event_schedule,
  Schedule,
  Photo,
  Hometown,
  user_hometown,
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
      .then(user_like => {
        callback(null, user_like);
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
  }

};