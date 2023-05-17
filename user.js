const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: String,
    lastActiveAt: Date,
    version: Number
  }, { timestamps: true });
  module.exports = mongoose.model('User', userSchema);