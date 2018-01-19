require('dotenv').config();
const express = require('express'),
  bodyParser = require('body-parser'),
  app = express(),
  cookieParser = require('cookie-parser'),
  morgan = require('morgan'),
  PORT = process.env.PORT || 3000,
  passport = require('passport'),
  jwt = require('jsonwebtoken'),
  db = require('../config/database'),
  dbConfig = require('../config/db-helpers');

require('../auth/local-auth')(passport);

app.use(express.static(`${__dirname}/dist`));
// set morgan to log info about our requests for development
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json('WANDER App');
});

app.get('/login', (req, res) => {

});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  dbConfig.getuserByEmail(email, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json('User does not exist');
    }
    dbConfig.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        const token = jwt.sign(user, db.pw, {expiresIn: 2592000000});

        return res.json({success: true, token: token, user:{
          id: user.id,
          email: user.email,
          password: user.password,
        }
        });
      } else {

        return res.json('Password is incorrect');
      }
    });
  });
});

app.get('/signup', (req, res) => {
  res.redirect('/signup');
});

app.post('/signup', (req, res) => {
  dbConfig.getuserByEmail(req.body.email, (err, user) => {
    if (err) throw err;
    if (user) {
      return res.json('An account already exists under this email');
    }
  });
  const newUser = new db.User({
    name: req.body.username,
    email_address: req.body.email,
    password: req.body.password,
  });
  dbConfig.createUser(newUser, (err, user) => {
    if (err) {
      return res.json({success: false, message: 'User was not created'});
    } else {
      return res.json({success: true, message: 'User was created'});
    }
  });
});

app.get('/dashboard', (req, res) => {

});

app.get('/logout', (req, res) => {
  res.redirect('/');
});
/*
    Dynamically Add types to type table
*/

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

// route for handling 404 requests(unavailable routes)
app.use(function (req, res) {
  res.status(404).send('Sorry can\'t find that!');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
