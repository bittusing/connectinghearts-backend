const mongoose = require("mongoose");

const partnerPrefSchema = new mongoose.Schema({
  age: {
    min: { type: Number },
    max: { type: Number }
  },
  height: {
    min: { type: Number },
    max: { type: Number }
  },
  income: {
    min: { type: Number },
    max: { type: Number }
  },
  maritalStatus: { type: [String] },
  religion: { type: [String] },
  motherTongue: { type: [String] },
  manglik: { type: [String] },
  //from here
  country: { type: [String] },
  residentialStatus: { type: [String] },
  occupation: { type: [String] },
  cast: { type: [String] },
  education: { type: [String] },
  horoscope: { type: [String] },
//till here
  clientID: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const partner = mongoose.model("PartnerPreference", partnerPrefSchema);
module.exports = partner;
