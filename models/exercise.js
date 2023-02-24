const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: false,
  },
  userId: mongoose.Schema.Types.ObjectId,
});

module.exports = mongoose.model('Exercise', exerciseSchema);
