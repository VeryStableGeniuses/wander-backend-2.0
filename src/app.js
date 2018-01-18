require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const PORT = process.env.PORT || 3000;

const db = require('../config/db-helpers');

app.use(express.static(`${__dirname}/dist`));

// set morgan to log info about our requests for development
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

app.post('/type', (req, res) => {
  let type = req.body;
  db.addType(type, (err, type) => {
    if (err) {
      console.error(err);
    } else {
      res.send(type);
    }
  });
});

app.get('/types', (req, res) => {
  db.getTypes((err, types) => {
    if (err) {
      console.error(err);
    } else {
      res.send(types);
    }
  });
});

app.post('/user', (req, res) => {
  const user = req.body;
  db.createUser(user, (err, newUser) => {
    if (err) {
      res.status(401).send(err);
    } else {
      res.send(newUser.dataValues);
      res.status(201).send('signup successful!');
    }
  });
});

// addUser: function (req, res) {
//   const user = req.body;
//   db.addUser(user, (err, newUser) => {
//     if (err) {
//       res.status(401).send(err);
//     } else {
//       req.session.user = newUser.dataValues;
//       res.status(201).send("signup successful!");
//     }
//   });
// },

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
