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

app.post('/api/users', async (req, res) => {
  const user = new User({ username: req.body.username });
  await user.save();

  res.json({ username: req.body.username, _id: user.id });
});

app.get('/api/users', async (req, res) => {
  const users = await User.find({});
  const data = users.map((user) => ({ username: user.username, _id: user.id }));

  res.json(data);
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const user = await User.findById(req.params._id);

  let exercise;

  if (req.body.date) {
    exercise = new Exercise({
      description: req.body.description,
      duration: req.body.duration,
      date: new Date(req.body.date).toDateString(),
      user: user.id,
    });
  } else {
    exercise = new Exercise({
      description: req.body.description,
      duration: req.body.duration,
      date: new Date().toDateString(),
      user: user.id,
    });
  }

  await exercise.save();

  res.json({
    _id: user.id,
    username: user.username,
    date: exercise.date,
    duration: exercise.duration,
    description: exercise.description,
  });
});

app.get('/api/users/:_id/logs', async (req, res) => {
  let exercises;

  const { from, to, limit } = req.query;

  const user = await User.findById(req.params._id);

  const count = await Exercise.findOne({}).count();

  if (from && to) {
    exercises = await Exercise.find({
      date: {
        $gte: new Date(from).toDateString(),
        $lte: new Date(to).toDateString(),
      },
    });
  } else if (limit) {
    exercises = await Exercise.find({}).limit(parseInt(limit));
  } else {
    exercises = await Exercise.find({});
  }

  const data = exercises.map((exe) => ({
    description: exe.description,
    duration: exe.duration,
    date: exe.date,
  }));

  res.json({
    _id: user.id,
    username: user.username,
    count: count,
    log: data,
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
