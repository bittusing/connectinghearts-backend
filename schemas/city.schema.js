const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
    state_id: String,
    cities: [{
        label: String,
        value: String
    }]
});

const Career = mongoose.model("City", citySchema);
module.exports = Career;
