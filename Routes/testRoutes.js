const express = require("express");
const { router } = require("../app");
const { testMail } = require("../Controller/Tests");

const Router = express.Router();

Router.route("/test/mail").get(testMail);

module.exports = Router;
