const express = require("express");
const SessionController = require("../Controller/SessionController");

const Router = express.Router();

Router.route("/MentorSlot").post(SessionController.slotManager);
Router.route("/SessionBooking").post(SessionController._sessionBooking);
Router.route("/removeSlot").post(SessionController.removeSlot);
Router.route("/airesult").post(SessionController._updateUserExpression);
Router.route("/userResume").post(SessionController._userResume);
Router.route("/updateuserdetail").post(SessionController.updateUserDetail);
Router.route("/requestForslot").post(SessionController._requestForSlot);
Router.route("/sessionFeedback").post(SessionController._roomFeedback);
module.exports = Router;
