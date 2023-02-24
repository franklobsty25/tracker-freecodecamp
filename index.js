const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');
const Exercise = require('./models/exercise');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', (req, res) => {
  const user = new User({ username: req.body.username });
  user.save((err, user) => {
    if (err) {
      return console.error(err);
    }

    res.json({ username: req.body.username, _id: user.id });
  });
});

app.get('/api/users', async (req, res) => {
  User.find({}, (err, user) => {
    if (err) {
      return console.error(err);
    }
    res.json(user);
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let exerciseObj = {
    user: req.params._id,
    description: req.body.description,
    duration: req.body.duration,
  };

  if (req.body.date) {
    exerciseObj.date = new Date(req.body.date).toDateString();
  } else {
    exerciseObj.date = new Date().toDateString()
  }

  const newExercise = new Exercise(exerciseObj);

  User.findById(req.params._id, (err, user) => {
    if (err) {
      return console.error(err);
    }

    newExercise.save();

    res.json({
      _id: user.id,
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date,
    });
  });
});

app.get('/api/users/:_id/logs', (req, res) => {
  const responseObj = {};

  User.findById(req.params._id, (err, user) => {
    if (err) {
      return console.error(err);
    }

    responseObj = {
      _id: user.id,
      username: user.username,
    };

    Exercise.find({ user: req.params._id }, (err, exercises) => {
      responseObj.log = exercises;
      responseObj.count = exercises.length;

      res.json(responseObj);
    });
  });
});

mongoose
  .connect(process.env.DATABASE_HOST)
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log(
        'Your app is listening on port ' +
          listener.address().port +
          ' with database connection successful'
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });
