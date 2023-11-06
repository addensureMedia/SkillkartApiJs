const express = require("express");
const {
  AdminLogin,
  isloggedIn,
} = require("../../Controller/AdminController/AuthController");

const router = express.Router();

router.route("/login").post(AdminLogin);
router.route("/isloggedIn").get(isloggedIn);

module.exports = router;
