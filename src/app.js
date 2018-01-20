require('dotenv').config();
const express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  PORT = process.env.PORT || 3000,
  passport = require('passport'),
  jwt = require('jsonwebtoken'),
  auth = require('../auth/local-auth'),
  dbConfig = require('../database/db-helpers'),
  models = require('../database/models/exports');

require('../auth/local-auth')(passport);

app.use(express.static(`${__dirname}/dist`));
// set morgan to log info about our requests for development
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json('WANDER App');
});

app.get('/login', (req, res) => {});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  dbConfig.getuserByEmail(email, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json('User does not exist');
    }
    dbConfig.comparePassword(password, user.dataValues.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign(user.dataValues, process.env.LOCALSECRET, null, null);

        return res.json({success: true, token: token, user:{
          id: user.dataValues.id,
          email: user.dataValues.email,
          password: user.dataValues.password,
        }
        });
      } else {

        return res.json('Password is incorrect');
      }
    });
  });
});

app.get('/signup', (req, res) => {});

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

app.get('/dashboard', passport.authenticate('jwt', {session: false}), (req, res) => {
  console.log(req.user);
  res.json({user: req.user});
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

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
      res.send(newEvent.dataValues);
    }
  });
});

app.post('/schedule', (req, res) => {
  let schedule = req.body;
  dbConfig.createSchedule(schedule, (err, newSchedule) => {
    if (err) {
      console.error(err);
    } else {
      res.send(newSchedule.dataValues);
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
app.use(function(req, res) {
  res.status(404).send('Sorry can\'t find that!');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
