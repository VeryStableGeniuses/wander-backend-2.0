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
// set morgan to log info about our requests for development
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json('WANDER app');
});

app.get('/login', (req, res) => { });

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  dbConfig.getuserByEmail(email, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user) {
      res.json('User does not exist');
    }
    dbConfig.comparePassword(password, user.password, (err, isMatch) => {
      if (err) {
        throw err;
      }
      if (isMatch) {
        const token = jwt.sign(user, db.pw);
        res.json(`token: ${token}`);
      } else {
        res.json('Password is incorrect');
      }
    });
  });
});

app.get('/signup', (req, res) => { });

app.post('/signup', (req, res) => {
  const newUser = new models.User({
    name: req.body.username,
    email_address: req.body.email,
    password: req.body.password
  });
  dbConfig.createUser(newUser, (err, user) => {
    if (err) {
      res.json('User was not created ', err);
    } else {
      return res.json('User created');
    }
  });
});

app.get('/dashboard', (req, res) => { });

app.get('/logout', (req, res) => { });

app.post('/type', (req, res) => {
  let type = req.body;
  dbConfig.addType(type, (err, type) => {
    if (err) {
      console.error(err);
    } else {
      res.send(type);
    }
  });
});

app.get('/types', (req, res) => {
  dbConfig.getTypes((err, types) => {
    if (err) {
      console.error(err);
    } else {
      res.send(types);
    }
  });
});

app.get('/users', (req, res) => {
  dbConfig.getUsers((err, users) => {
    if (err) {
      console.error(err);
    } else {
      res.send(users);
    }
  });
});

app.get('/user/:uid/likes', (req, res) => {
  let userId = req.params.uid;
  dbConfig.getUserLikes(userId, (err, likes) => {
    if (err) {
      console.error(err);
    } else {
      res.send(likes);
    }
  });
});

app.post('/user_like', (req, res) => {
  let userLike = req.body;
  dbConfig.addUserLike(userLike, (err, userLike) => {
    if (err) {
      console.error(err);
    } else {
      res.send(userLike.dataValues);
    }
  });
});

app.post('/event', (req, res) => {
  let event = req.body;
  dbConfig.addEvent(event, (err, newEvent) => {
    if (err) {
      console.error(err);
    } else {
      res.send('added new event');
    }
  });
});

app.post('/schedule', (req, res) => {
  let schedule = req.body;
  console.log('body', schedule);
  res.status(201).send('found schedule route');
  // dbConfig.createSchedule(schedule, (err, newSchedule) => {
  //   if (err) {
  //     console.error(err);
  //   } else {
  //     res.send(newSchedule.dataValues);
  //   }
  // });
});

app.get('/schedule/:sid/events', (req, res) => {
  let sid = req.params.sid;
  dbConfig.getEventsForSchedule(sid, (err, events) => {
    if (err) {
      console.error(err);
    } else {
      res.send(events);
    }
  });
});

app.get('/user/:uid/schedule', (req, res) => {
  let uid = req.params.uid;
  dbConfig.getSchedulesForUser(uid, (err, schedule) => {
    if (err) {
      console.error(err);
    } else {
      res.send(schedule);
    }
  });
});

app.get('/photos', (req, res) => {
  dbConfig.getPhotos((err, photos) => {
    if (err) {
      console.error(err);
    } else {
      res.send(photos);
    }
  });
});

app.post('/user/:uid/event_schedule', (req, res) => {
  console.log('at beginning of POST', req);
  //   // the body here includes:
  //   // uid: the user's id
  //   // start: the start time
  //   // end: the end time
  //   // location: the location

  //   // const start = new Date('February 10, 2018 00:00:00');
  //   // const end = new Date('Febrauary 13, 2018 00:00:00');
  //   // const query = 'New Orleans';
  //   // const interests = ['museum', 'park', 'point_of_interest', 'music'];

  let uid = req.body.userId;
  dbConfig.getUserLikes(uid, (err, likes) => {
    let startDate = req.body.startDate;
    console.log('start date before getSchedule', startDate);
    let endDate = req.body.endDate;
    let location = req.body.location;
    console.log(location);
    getSchedule(startDate, endDate, location, likes, schedule => {
      console.log('start date in POST', startDate);
      console.log('end date in POST', endDate);
      console.log('location in POST', location);
      for (let event in schedule) {
        dbConfig.createSchedule(event, (err, newSchedule) => {
          if (err) {
            console.error(err);
          } else {
            res.send(newSchedule.dataValues);
          }
        });
      }
    });
  });
});

// app.post('/schedule', (req, res) => {
//   let schedule = req.body;
//   dbConfig.createSchedule(schedule, (err, newSchedule) => {
//     if (err) {
//       console.error(err);
//     } else {
//       res.send(newSchedule.dataValues);
//     }
//   });
// });

// { startDate: '2018-02-20T18:03:13.000Z',
//   endDate: '2018-02-22T18:03:13.000Z',
//   location: 'New York City, NY, United States',
//   userId: '1' }

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
      console.error(err);
    } else {
      res.send(newPhoto.dataValues);
    }
  });
});

// route for handling 404 requests(unavailable routes)
app.use(function (req, res) {
  res.status(404).send('Sorry can\'t find that!');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});