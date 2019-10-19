const mongoose = require("mongoose");

const uNameAndId = new mongoose.Schema({
  username: String,
  _id: String,
  fitnessData: Array
});

const UsernameAndId = mongoose.model("UsernameAndId", uNameAndId);

module.exports = UsernameAndId;
