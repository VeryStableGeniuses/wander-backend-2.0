require('dotenv').config();
const express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  PORT = process.env.PORT || 3000,
  passport = require('passport'),
  jwt = require('jsonwebtoken'),
  db = require('../config/database'),
  dbConfig = require('../config/db-helpers');

require('../auth/local-auth')(passport);

app.use(express.static(`${__dirname}/dist`));
// set morgan to log info about our requests for development
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json('WANDER app');
});

app.get('/login', (req, res) => {

});

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

app.get('/signup', (req, res) => {

});

app.post('/signup', (req, res) => {
  const newUser = new db.User({
    name: req.body.username,
    email_address: req.body.email,
    password: req.body.password,
  });
  dbConfig.createUser(newUser, (err, user) => {
    if (err) {

      res.json('User was not created ', err);
    } else {

      return res.json('User created');
    }
  });
});

app.get('/dashboard', (req, res) => {

});

app.get('/logout', (req, res) => {
  
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
  db.getUsers((err, users) => {
    if (err) {
      console.error(err);
    } else {
      res.send(users);
    }
  });
});

app.get('/user_likes', (req, res) => {
  let userId = req.params.uid;
  db.getUserLikes(userId, (err, likes) => {
    if (err) {
      console.error(err);
    } else {
      res.send(likes);
    }
  });
});

app.post('/event', (req, res) => {
  let event = req.body;
  db.addEvent(event, (err, newEvent) => {
    if (err) {
      console.error(err);
    } else {
      res.send(newEvent.dataValues);
    }
  });
});

app.post('/schedule', (req, res) => {
  let schedule = req.body;
  db.createSchedule(schedule, (err, newSchedule) => {
    if (err) {
      console.error(err);
    } else {
      res.send(newSchedule.dataValues);
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
