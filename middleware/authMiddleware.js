const jwt = require("jsonwebtoken");
const { JWT_SECRETE } = process.env;

exports.TokenVerification = async (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token);
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRETE);
    console.log(decoded)
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid token." });
  }
};
