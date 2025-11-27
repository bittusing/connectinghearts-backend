const mongoose = require("mongoose");

const familySchema = new mongoose.Schema({
  familyStatus:{type:String},
  familyValues:{type:String},
  familyType:{type:String},
  familyIncome:{type:Number},
  fatherOccupation:{type:String},
  motherOccupation:{type:String},
  brothers:{type:String},
  marriedBrothers:{type:String},
  sisters:{type:String},
  marriedSisters:{type:String},
  gothra:{type:String},
  livingWithParents:{type:String},
  familyBasedOutOf:{type:String},
  aboutMyFamily:{type:String},
  favMusic:{type:String},
  clientID: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Career = mongoose.model("FamilyDetails", familySchema);
module.exports = Career;
