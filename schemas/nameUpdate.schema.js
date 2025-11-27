const mongoose = require('mongoose');

const nameUpdateSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  updateCount: {
    type: Number,
    default: 0
  }
});
module.exports = mongoose.model("nameUpdate", nameUpdateSchema);