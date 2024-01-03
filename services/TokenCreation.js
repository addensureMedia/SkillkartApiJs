const jwt = require("jsonwebtoken");
const { JWT_SECRETE } = process.env;

const jsontoken = async (id) => {
  return jwt.sign({ data: id }, JWT_SECRETE, {
    expiresIn: "90d",
  });
};

exports.createtoken = async (user, statuscode, res, req) => {
  const token = await jsontoken(user._id);
  return res.status(statuscode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
