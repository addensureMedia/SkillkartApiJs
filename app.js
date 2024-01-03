const dotenv = require("dotenv");
const mongoose = require("mongoose");
const db = require("./config/Database");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const AuthRouter = require("./Routes/AuthRoutes");
const ProductRouter = require("./Routes/ProductRoutes");
const OtherRouter = require("./Routes/OtherRoutes");
const JobRouter = require("./Routes/JobRoutes");
const sessionRouter = require("./Routes/SessionsRoutes");
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(bodyParser.json());

app.use("/api/v1.3", AuthRouter);
app.use("/api/v1.3", ProductRouter);
app.use("/api/v1.3", JobRouter);
app.use("/api/v1.3", sessionRouter);
app.use("/api/v1.3", OtherRouter);

app.all("*", (req, res) => {
  return res.status(404).json({
    status: "failed",
    error: "endpoint not found",
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
});

module.exports = app;
