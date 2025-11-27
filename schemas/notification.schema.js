const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    "clientID": mongoose.Schema.ObjectId,
    "ids":Array,
    "type":String
});

const notification = mongoose.model("notification", notificationSchema);
module.exports = notification;
