const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config/config.env" });

module.exports = mongoose
  .connect(process.env.mongodb_url, {
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log("db connected");
  })
  .catch((error) => {
    console.log(error, "its a error");
  });
