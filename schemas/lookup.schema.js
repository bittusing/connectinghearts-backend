const mongoose = require("mongoose");

const lookupSchema = new mongoose.Schema({
  income:[],
  employed_in:[],
  familyStatus:[],
  familyType:[],
  familyValues:[],
  fathersOccupation:[],
  height:[],
  highestEducation:[],
  mothersOccupation:[],
  nakshatra:[],
  occupation:[],
  rashi:[],
  casts:[]
});

const lkp = mongoose.model("lookup", lookupSchema);
module.exports = lkp;
