const express = require("express");
const AuthController = require("../Controller/AuthController");
const jwtMiddleware = require("../middleware/authMiddleware");
const { siteJobs } = require("../Controller/OtherController");

const Router = express.Router();

Router.route("/Sitejobs").get(siteJobs);

module.exports = Router;
