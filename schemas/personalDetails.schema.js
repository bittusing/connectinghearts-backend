const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  gender: {
    type: String,
    required: true,
  },
  aboutMe: {
    type: String,
  },
  managedBy: {
    type: String,
  },
  dob: {
    type: Date,
    required: true,
  },
  height: {
    type: Number,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  income: {
    type: Number,
  },
  organisationName:String,
  employed_in:{
    type:String
  },
  residentialStatus: {
    type: String,
  },
  maritalStatus: {
    type: String,
  },
  occupation: {
    type: String,
  },
  religion: {
    type: String,
  },
  cast: {
    type: String,
  },
  disability: {
    type: String,
  },
  bodyType: {
    type: String,
  },
  thalassemia: {
    type: String,
  },
  hivPositive: {
    type: String,
  },
  interestedInSettlingAbroad: {
    type: String,
  },
  motherTongue: {
    type: String,
  },
  education: {
    qualification: { type: String },
    otherUGDegree: { type: String },
    aboutEducation: { type: String },
    school: { type: String },
  },
  castNoBar: {
    type: String,
  },
  aboutMyCareer: {
    type: String,
  },
  rashi: {
    type: String,
  },
  // isDeleted: {
  //   type: Boolean,
  //   default: false
  // },
  nakshatra: {
    type: String,
  },
  manglik: {
    type: String,
  },
  horoscope: {
    type: String,
  },
  countryOfBirth: {
    type: String,
  },
  stateOfBirth: {
    type: String,
  },
  cityOfBirth: {
    type: String,
  },
  timeOfBirth: {
    type: String,
  },
  haveChildren: { type: String },
  clientID: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const User = mongoose.model("PersonalDetails", userSchema);
module.exports = User;
