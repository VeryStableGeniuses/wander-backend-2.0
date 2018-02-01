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
  const email = req.body.email;
  const password = req.body.password;
  dbConfig.getuserByEmail(email, (err, user) => {
    const tokenData = {
      id: user.id,
      name: user.name,
      email_address: user.email_address
    };
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
        const token = jwt.sign(tokenData, process.env.LOCALSECRET);
        res.json(`JWT ${token}`);
      } else {
        res.json('Password is incorrect');
      }
    });
  });
});

app.post('/signup', (req, res) => {
  dbConfig.getuserByEmail(req.body.email, (error, email) => {
    if (email) {
      return res.json('An account already exists using the Email Address');
    } else {
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
            email_address: user.email_address
          };
          const token = jwt.sign(tokenData, process.env.LOCALSECRET);
          return res.json(token);
        }
      });
    }
  });
});

app.get(
  '/dashboard',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // route on dashboard that'll get all schedules tied to a user.
    dbConfig.getSchedulesForUser(req.user.id, (err, schedules) => {
      if (err) {
        console.log(`db get schedules error ${err}`);
      } else {
        res.status(200).send(schedules);
      }
    });
  }
);

app.get('/logout', (req, res) => {
  res.json('You are logged out');
});

app.post('/type', (req, res) => {
  const type = req.body;
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

app.get(
  '/user/likes',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let userId = req.user.id;
    dbConfig.getUserLikes(userId, (err, likes) => {
      if (err) {
        res.send(err);
      } else {
        res.status(200).send(likes);
      }
    });
  }
);

app.post(
  '/user_like',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let userLike = req.body;
    userLike.id_user = req.user.id;
    dbConfig.addUserLike(userLike, (err, userLike) => {
      if (err) {
        res.send(err);
      } else {
        res.status(201).send(userLike);
      }
    });
  }
);

app.delete(
  '/user_like',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let userLike = {};
    userLike.id_type = parseInt(req.query.id_type);
    userLike.like = req.query.like;
    userLike.id_user = req.user.id;
    dbConfig.deleteUserLike(userLike, (err, userLike) => {
      if (err) {
        res.send(err);
      } else {
        res.status(201).send(userLike);
      }
    });
  }
);

app.get('/events', (req, res) => {
  dbConfig.getEvents((err, events) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(events);
    }
  });
});

app.get('/event/:eid', (req, res) => {
  const eventId = req.params.eid;
  dbConfig.getEventById(eventId, (err, event) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(event);
    }
  });
});

app.post('/event', (req, res) => {
  const event = req.body;
  dbConfig.addEvent(event, (err, newEvent) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(newEvent);
    }
  });
});

app.get('/:sid/schedules', (req, res) => {
  const scheduleId = req.params.sid;
  dbConfig.getEventsForSchedule(scheduleId, (err, events) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(events);
    }
  });
});

app.get('/schedule/:sid', (req, res) => {
  const scheduleId = req.params.sid;
  dbConfig.getSchedulesForDashboard(scheduleId, (err, schedule) => {
    if (err) {
      res.status(404).send(err);
    } else {
      res.status(200).send(schedule);
    }
  });
});

app.post('/schedule', (req, res) => {
  const schedule = req.body;
  dbConfig.createSchedule(schedule, (err, newSchedule) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(newSchedule);
    }
  });
});

app.get('/schedule/:sid/events', (req, res) => {
  const sid = req.params.sid;
  dbConfig.getEventsForSchedule(sid, (err, events) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(events);
    }
  });
});

app.post('/user_schedule', (req, res) => {
  const userSchedule = req.body;
  dbConfig.createUserSchedule(userSchedule, (err, newUserSchedule) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(newUserSchedule);
    }
  });
});

app.get(
  '/user/schedules',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const uid = req.user.id;
    dbConfig.getSchedulesForUser(uid, (err, schedule) => {
      if (err) {
        res.send(err);
      } else {
        res.status(200).send(schedule);
      }
    });
  }
);

function generateEventsForSchedule(dbSchedule, schedule) {
  delete schedule.name; // remove the schedule name, we already saved it on the db schedule

  const days = Object.keys(schedule);
  // loop over all of the days (day_1, day_2, day_3, day_4)
  days.forEach(day => {
    // loop over all of the event categories (events, liveEvents, restaurants)
    const categories = Object.keys(schedule[day]);
    categories.forEach(categoryKey => {
      if (categoryKey !== 'date' && categoryKey !== 'userLikes') {
        // loop over all of the events in the category
        schedule[day][categoryKey].forEach(event => {
          const eventObj = {
            name: event.name ? event.name : event.title,
            latitude: event.location
              ? event.location.latitude
              : event.latlng.lat,
            longitude: event.location
              ? event.location.longitude
              : event.latlng.lng,
            googleId: event.placeId,
            startTime: event.start
          };

          dbConfig.addEvent(eventObj, (err, newEvent) => {
            const newEventSchedule = {
              id_schedule: dbSchedule.id,
              id_event: newEvent.id,
              dateTime: schedule[day]['date']
            };

            dbConfig.addEventSchedule(
              newEventSchedule,
              (err, newEventSchedule) => {
                console.log('added scheduled event:', newEventSchedule);
              }
            );
          });
        });
      }
    });
  });
}

app.post(
  '/user/schedule',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const uid = req.user.id;

    const schedule = { name: req.body.schedule.name };

    dbConfig.createSchedule(schedule, (err, newSchedule) => {
      if (err) {
        res.send(err);
      }
      const userSchedule = {
        id_user: uid,
        id_schedule: newSchedule.id,
        status: 'creator'
      };
      dbConfig.createUserSchedule(userSchedule, (err, newUserSchedule) => {
        if (err) {
          res.send(err);
        } else {
          res.status(201).send(newUserSchedule);
        }

        generateEventsForSchedule(newSchedule, req.body.schedule);
      });
    });
  }
);

app.delete('/schedule', (req, res) => {
  const schedule = req.body;
  dbConfig.deleteSchedule(schedule, err => {
    if (err) {
      res.send(err);
    } else {
      res.send('deleted schedule');
    }
  });
});

app.post(
  '/join_schedule',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const uid = req.user.id;
    if (req.body.userEmail) {
      // Grab out the scheduleId and the email of the person to be added
      const { scheduleId, userEmail } = req.body;
      // Find the target user by their email
      dbConfig.getuserByEmail(userEmail, (err, user) => {
        // Once we find the user, call createUserSchedule to add an entry to the user_schedule join table
        dbConfig.createUserSchedule(
          { id_schedule: scheduleId, id_user: user.id, status: 'invited' },
          (err, dbResponse) => {
            if (err) {
              // If unsuccessful, set the status and send an error
              res.status(400).send(err);
            } else {
              // Send the response back if successful
              res.status(201).send(dbResponse);
            }
          }
        );
      });
    } else {
      const { scheduleId } = req.body;
      dbConfig.createUserSchedule(
        { id_schedule: scheduleId, id_user: uid, status: 'attending' },
        (err, dbResponse) => {
          if (err) {
            res.status(400).send(err);
          } else {
            res.status(201).send(dbResponse);
          }
        }
      );
    }
  }
);

app.post('/accept_invite', passport.authenticate('jwt', { session: false }), (req, res) => {
  // Get the user id from the request. I've used my own as a placeholder
  const userId = req.user.id;
  const { scheduleId, accepted } = req.body;
  if (accepted === 'true') {
    dbConfig.updateUserSchedule(userId, scheduleId, (err, response) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(204).send(response);
      }
    });
  } else {
    dbConfig.deleteUserSchedule(userId, scheduleId, (err, success) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(204).send(success);
      }
    });
  }
});

app.get('/event_schedules', (req, res) => {
  dbConfig.getEventSchedule((err, eventSchedules) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(eventSchedules);
    }
  });
});

app.post('/event_schedule', (req, res) => {
  const eventSchedule = req.body;
  dbConfig.addEventSchedule(eventSchedule, (err, newEventSchedule) => {
    if (err) {
      res.send(err);
    } else {
      res.status(201).send(newEventSchedule);
    }
  });
});

app.delete('/event_schedule', (req, res) => {
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

app.get('/photo', (req, res) => {
  // let uid = req.user.id;
  let uid = 85; // just hardcode user id for now

  dbConfig.getPhotoByUid(uid, (err, photo) => {
    if (err) {
      res.send(err);
    } else {
      res.status(200).send(photo);
    }
  });
});

app.post('/photo', (req, res) => {
  let photo = req.body;
  // photo.id_user = req.user.id;
  photo.id_user = 85; // just hardcode user id for now

  /* photo object will look like:
	* {
	*		url: https://aws.blahblah/photo,
	*	  id_user: 7
	*	}
	*/

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
