const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
    country_id: String,
    states: [{
        label: String,
        value: String
    }]
});

const Career = mongoose.model("State", stateSchema);
module.exports = Career;
