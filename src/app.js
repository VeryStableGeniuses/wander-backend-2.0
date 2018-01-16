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

// route for handling 404 requests(unavailable routes)
app.use(function (req, res) {
  res.status(404).send('Sorry can\'t find that!');
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});