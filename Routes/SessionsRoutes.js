const express = require("express");
const {
  slotManager,
  removeSlot,
  _sessionBooking,
  _updateUserExpression,
  updateUserDetail,
} = require("../Controller/SessionController");

const Router = express.Router();

Router.route("/MentorSlot").post(slotManager);
Router.route("/removeSlot").post(removeSlot);
Router.route("/airesult").post(_updateUserExpression);
Router.route("/updateuserdetail").post(updateUserDetail);
module.exports = Router;
