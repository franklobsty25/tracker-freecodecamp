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
    userId: req.params._id,
    description: req.body.description,
    duration: req.body.duration,
  };

  if (req.body.date) {
    exerciseObj.date = new Date(req.body.date).toDateString();
  } else {
    exerciseObj.date = new Date().toDateString();
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

app.get('/api/users/:_id/logs', async (req, res) => {
  // let responseObj = {};
  // let userId = req.params._id;
  // let from = req.query.from;
  // let to = req.query.to;
  // let limit = req.query.limit;
  // let queryObj = { userId };

  // limit = limit ? parseInt(limit) : limit;

  // if (from || to) {
  //   queryObj.date = {};

  //   if (from) {
  //     queryObj.date['$gte'] = from;
  //   }

  //   if (to) {
  //     queryObj.date['$lte'] = to;
  //   }
  // }

  // User.findById(userId, (err, user) => {
  //   if (err) {
  //     return console.error(err);
  //   }

  //   responseObj = {
  //     _id: user.id,
  //     username: user.username,
  //   };

  //   Exercise.find(queryObj)
  //     .limit(limit)
  //     .exec((err, exercises) => {
  //       if (err) {
  //         return console.error(err);
  //       }

  //       exercises = exercises.map((exercise) => {
  //         return {
  //           description: exercise.description,
  //           duration: exercise.duration,
  //           date: exercise.date
  //         };
  //       });

  //       responseObj.count = exercises.length;
  //       responseObj.log = exercises;

  //       res.json(responseObj);
  //     });
  // });

  const { from, to, limit } = req.query;
  let userId = req.params._id;
  const query = { userId };

  if (from || to) {
    query.date = {};

    if (from) {
      query.date['$gte'] = from;
    }

    if (to) {
      query.date['$lte'] = to;
    }
  }

  const user = await User.findById(userId);
  const exerciseQuery = Exercise.find(query);
  if (limit) {
    exerciseQuery.limit(parseInt(limit));
  }

  const exercises = await exerciseQuery;

  res.json({
    ...user.toJSON(),
    count: await Exercise.countDocuments({ userId }),
    log: exercises.map((exercise) => {
      return {
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date,
      };
    }),
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
