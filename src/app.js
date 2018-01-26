require('dotenv').config();
const express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  PORT = process.env.PORT || 3000,
  passport = require('passport'),
  jwt = require('jsonwebtoken'),
  db = require('../database/database'),
  dbConfig = require('../database/db-helpers'),
  models = require('../database/models/exports');

require('../auth/local-auth')(passport);

const { getSchedule } = require('../scheduleBuilder');

// app.use(express.static(`${__dirname}/dist`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json('WANDER app');
});

app.post('/login', (req, res) => {
  console.log('login hit');
  const email = req.body.email;
  const password = req.body.password;
  dbConfig.getuserByEmail(email, (err, user) => {
    const tokenData = {
      id: user.id,
      name: user.name,
      email_address: user.email_address,
    };
    if (err) {
      throw err;
    }
    if (!user) {
      res.json('User does not exist');
    }
    dbConfig.comparePassword(
      password,
      user.password,
      (err, isMatch) => {
        if (err) {
          throw err;
        }
        if (isMatch) {
          const token = jwt.sign(tokenData, process.env.LOCALSECRET);
          res.json(`JWT ${token}`);
        } else {
          res.json('Password is incorrect');
        }
      }
    );
  });
});

app.post('/signup', (req, res) => {
  const newUser = new models.User({
    name: req.body.username,
    email_address: req.body.email,
    password: req.body.password
  });
  dbConfig.createUser(newUser, (err, user) => {
    if (err) {
      res.json('User was not created');
    } else {
      const tokenData = {
        id: user.id,
        name: user.name,
        email_address: user.email_address,
      };
      const token = jwt.sign(tokenData, process.env.LOCALSECRET);
      return res.json(token);
    }
  });
});

app.get('/dashboard', passport.authenticate('jwt', { session: false }), (req, res) => {
  // route on dashboard that'll get all schedules tied to a user.
  dbConfig.getSchedulesForUser(req.user.id, (err, schedules) => {
    if (err) {
      console.log(`db get schedules error ${err}`);
    } else {
      res.status(200).send(schedules);
    }
  });
});

app.get('/logout', (req, res) => {
  res.json('You are logged out');
});

app.post('/type', (req, res) => {
  let type = req.body;
  dbConfig.addType(type, (err, type) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(type);
    }
  });
});

app.get('/types', (req, res) => {
  dbConfig.getTypes((err, types) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(types);
    }
  });
});

app.get('/users', (req, res) => {
  dbConfig.getUsers((err, users) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(users);
    }
  });
});

app.get('/user/likes', passport.authenticate('jwt', { session: false }), (req, res) => {
  let userId = req.user.id;
  dbConfig.getUserLikes(userId, (err, likes) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(likes);
    }
  });
});

app.post('/user_like', passport.authenticate('jwt', { session: false }), (req, res) => {
  let userLike = req.body;
  const userId = req.user.id;
  userLike.id_user = userId;
  userLike.like = true;
  dbConfig.addUserLike(userLike, (err, userLike) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(userLike);
    }
  });
});

app.get('/events', (req, res) => {
  dbConfig.getEvents((err, events) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(events);
    }
  });
});

app.get('event', (req, res) => {
  let eventId = req.params.eid;
  dbConfig.getEventById(eventId, (err, event) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(event);
    }
  });
});

app.post('/event', (req, res) => {
  let event = req.body;
  dbConfig.addEvent(event, (err, newEvent) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(newEvent);
    }
  });
});

app.get('/:sid/schedules', (req, res) => {
  let scheduleId = req.params.sid;
  dbConfig.getEventsForSchedule(scheduleId, (err, events) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(events);
    }
  });
});

// when you receive schedule, get all events tied to that schedule
// create Schedule, scheduled events, etc. based on user_likes

app.post('/schedule', (req, res) => {
  let schedule = req.body;
  dbConfig.createSchedule(schedule, (err, newSchedule) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(newSchedule);
    }
  });
});

app.get('/schedule/:sid/events', (req, res) => {
  let sid = req.params.sid;
  dbConfig.getEventsForSchedule(sid, (err, events) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(events);
    }
  });
});

app.post('/user_schedule', (req, res) => {
  let userSchedule = req.body;
  dbConfig.createUserSchedule(userSchedule, (err, newUserSchedule) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(newUserSchedule);
    }
  });
});

app.get('/user/:sid/schedule', (req, res) => {
  let sid = req.params.sid;
  dbConfig.getSchedulesForUser(sid, (err, schedule) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(schedule);
    }
  });
});

// function generateEventsForSchedule(userSchedule, schedule) {
//   // console.log(schedule);
//   let days = Object.keys(schedule);
//   days.forEach(day => {
//     let events = Object.keys(schedule[day]);
//     events.forEach(eventKey => {
//       if (eventKey !== 'date') {
//         let eventName = schedule[day][eventKey].name;
//         let eventLocation = schedule[day][eventKey].location;
//         let event = {
//           name: eventName,
//           latitude: eventLocation.latitude,
//           longitude: eventLocation.longitude
//         };

//         dbConfig.addEvent(event, (err, newEvent) => {
//           let newEventSchedule = {
//             id_schedule: userSchedule.id,
//             id_event: newEvent.id,
//             date_time: schedule[day]['date']
//           };

//           dbConfig.addEventSchedule(
//             newEventSchedule,
//             (err, req, res, newEventSchedule) => {
//               // console.log('newEvent', newEventSchedule);
//               if (err) {
//                 res.send(err);
//               } else {
//                 res.status(201).send(newEventSchedule);
//               }
//             }
//           );
//         });
//       }
//     });
//   });
// }

app.post('/user/event_schedule', (req, res) => {
  const uid = req.body.userId;
  // const startDate = new Date(req.body.startDate);
  // const endDate = new Date(req.body.endDate);
  const location = req.body.location;


  const startDate = new Date('February 10, 2018 00:00:00');
  const endDate = new Date('February 13, 2018 00:00:00');
  // const likes = ['museum', 'park', 'point_of_interest', 'music'];

  const schedule = { name: 'New Schedule' };

  // getSchedule(startDate, endDate, location, likes, eventSchedule => {
  //   res.json(eventSchedule);
  // });

  dbConfig.createSchedule(schedule, (err, newSchedule) => {
    if (err) {
      res.send(err);
    }
    const userSchedule = { id_user: uid, id_schedule: newSchedule.id };
    dbConfig.createUserSchedule(userSchedule, (err, newUserSchedule) => {
      if (err) {
        res.send(err);
      }
      dbConfig.getUserLikes(uid, (err, likes) => {
        if (err) {
          res.send(err);
        }
        getSchedule(startDate, endDate, location, likes, eventSchedule => {
          res.status(201).json({
            schedule: newSchedule,
            userSchedule: newUserSchedule,
            eventSchedule: eventSchedule
          });
        });
      });
    });
  });
});

app.delete('event_schedule', (req, res) => {
  const eventSchedule = req.body;
  dbConfig.deletescheduledEvent(eventSchedule, err => {
    if (err) {
      res.send(err);
    } else {
      res.send('deleted scheduled Event');
    }
  });
});

app.get('/photos', (req, res) => {
  dbConfig.getPhotos((err, photos) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(photos);
    }
  });
});
// app.get('/photo', (req, res) => {
//   dbConfig.getPhotoById((err, photo) => {
//     if (err) {
//       console.error(err);
//     } else {
//       res.send(photo);
//     }
//   });
// });

app.post('/photo', (req, res) => {
  let photo = req.body;
  dbConfig.addPhoto(photo, (err, newPhoto) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(newPhoto.dataValues);
    }
  });
});

// route for handling 404 requests(unavailable routes)
app.use(function(req, res) {
  res.status(404).send('Sorry can\'t find that!');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
