const express = require("express");
const { addReferal, getmentors } = require("../Controller/OtherController");
const Router = express.Router();

Router.route("/referal").post(addReferal);
Router.route("/getmentors").get(getmentors);

module.exports = Router;
