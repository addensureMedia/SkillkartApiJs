const jwt = require("jsonwebtoken");
const Email = require("./EmailService");
const { JWT_SECRETE } = process.env;

exports.jsontoken = async (id) => {
  return jwt.sign({ data: id }, JWT_SECRETE, {
    expiresIn: "90d",
  });
};

exports.createtoken = async (user, statuscode, res, req) => {
  const token = await this.jsontoken(user._id);
  console.log(token);
  return res.status(statuscode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
