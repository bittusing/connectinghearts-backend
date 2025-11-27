const mongoose = require('mongoose');

const lifestyleSchema = new mongoose.Schema({
  clientID: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  habits: String,
  assets: String,
  movies: String,
  languages: Array,
  foodICook: String,
  hobbies: Array,
  interest: Array,
  books: Array,
  dress: Array,
  sports: Array,
  cuisine: Array,
  favMusic: Array,
  favRead: String,
  favTVShow: String,
  vacayDestination: String,
  dietaryHabits:String,
  drinkingHabits:String,
  smokingHabits:String,
  openToPets:String,
  ownAHouse:String,
  ownACar:String,
  foodICook:String,

});

const User = mongoose.model('LifeStyle', lifestyleSchema);
module.exports = User;