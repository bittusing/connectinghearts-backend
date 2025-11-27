const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema({
label:String,
value:String
});

const Career = mongoose.model("Country", countrySchema);
module.exports = Career;
