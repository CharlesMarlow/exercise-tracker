const mongoose = require("mongoose");

const fitnessTemplate = new mongoose.Schema({
  username: { 
    type: String, 
    required: true
     },
  description: {
    type: String,
    required: true 
    },
  duration: { 
    type: Number,
    required: true
    },
  _id: String,
  date: Date,
});

const UserFitnessData = mongoose.model("UserFitnessData", fitnessTemplate);

module.exports = UserFitnessData;
