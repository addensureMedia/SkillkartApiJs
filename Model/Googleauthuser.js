const mongoose = require("mongoose");

const GoogleUserModel = new mongoose.Schema({
  Name: String,
  authId: String,
  Email: {
    type: String,
    unique: true,
  },
  Emailverified: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "recuirter", "admin"],
    default: "user",
  },
  phone: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  Linkedinprofile: String,
  passwordResetToken: {
    type: String,
  },
  stream: String,
  degree: String,
  graduateyear: String,
  step: Number,
  college: String,
  ipaddress: String,
  lastlogin: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Googleauth = mongoose.model("Googleuser", GoogleUserModel);
module.exports = Googleauth;
