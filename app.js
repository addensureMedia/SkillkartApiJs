const dotenv = require("dotenv");
const path = require("path");
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
const testRouter = require("./Routes/testRoutes");
const cors = require("cors");
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.options("*", cors());
app.use(bodyParser.json());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "Template"));

// app.use(express.static(path.join(__dirname, "./build")));

app.use("/api/v1.3", AuthRouter);
app.use("/api/v1.3", ProductRouter);
app.use("/api/v1.3", JobRouter);
app.use("/api/v1.3", sessionRouter);
app.use("/api/v1.3", OtherRouter);
app.use("/api/v1.3", testRouter);

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./build/index.html"));
// });

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
