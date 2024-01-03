const mongoose = require("mongoose");

const TranscationModel = new mongoose.Schema({
  user: String,
  user_name: String,
  course: String,
  course_id: String,
  price: Number,
  status: String,
  order_id: String,
  payment_id: String,
  Purchasedate: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Transcation = mongoose.model("transcation", TranscationModel);
module.exports = Transcation;
