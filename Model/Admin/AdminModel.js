const mongoose = require("mongoose");

const AdminModel = new mongoose.Schema({
  Name: String,
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
  completed: {
    type: Boolean,
    default: false,
  },
  ipaddress: String,
  lastlogin: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Admin = mongoose.model("Admins", AdminModel);
module.exports = Admin;
