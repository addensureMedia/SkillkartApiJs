const express = require("express");
const ProductManager = require("../Controller/ProductManager");
const jwtMiddleware = require("../middleware/authMiddleware");
const {
  Payment,
  SuccessTranscation,
} = require("../Controller/TranscationController");

const Router = express.Router();

Router.route("/product").get(ProductManager._getProducts);
Router.route("/payment").post(Payment);
Router.route("/paymentstatus").post(SuccessTranscation);

module.exports = Router;
