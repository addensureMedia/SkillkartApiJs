const express = require("express");
const AuthController = require("../Controller/AuthController");
const jwtMiddleware = require("../middleware/authMiddleware");

const Router = express.Router();

Router.route("/isLoggedIn").get(
  jwtMiddleware.TokenVerification,
  AuthController.isLoggedin
);
Router.route("/Login").post(AuthController.login);
Router.route("/signup").post(AuthController.signup);

Router.route("/becomeMentor")
  .post(AuthController.BecomeaMentor)
  .get(AuthController.EmailVerification);

Router.route("/onBoarding")
  .post(jwtMiddleware.TokenVerification, AuthController.onBoarding)
  .get(
    jwtMiddleware.TokenVerification,
    AuthController.OnboardingTokenVerification
  );

Router.route("/forgotPassword")
  .post(jwtMiddleware.TokenVerification, AuthController.onBoarding)
  .get(
    jwtMiddleware.TokenVerification,
    AuthController.OnboardingTokenVerification
  );

module.exports = Router;
