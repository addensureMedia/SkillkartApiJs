const mongoose = require("mongoose");

const Secretaschema = new mongoose.Schema({
  username: { type: String },
  Email: String,
  phone: String,
  password: String,
  ftoken: String,
});

module.exports = Secretauser = mongoose.model("SecretaUser", Secretaschema);
