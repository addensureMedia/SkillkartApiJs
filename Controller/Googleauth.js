const Googleauth = require("../Model/Googleauthuser");
const Referal = require("../Model/Referal");
const User = require("../Model/Usermodel");
const Recuirtment = require("../Model/recuirter");
const jwt = require("jsonwebtoken");

const jsontoken = async (id) => {
  return jwt.sign({ data: id }, process.env.JWT_SECRETE, {
    expiresIn: "90d",
  });
};

const createtoken = async (user, statuscode, res, req) => {
  const token = await jsontoken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.status(statuscode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.googlesignup = async (req, res) => {
  const { name, email, emailverify, photo, authid } = req.body;

  const rec = await Recuirtment.findOne({
    Email: email.toLowerCase(),
  });

  const user = await User.findOne({
    Email: email.toLowerCase(),
  });
  const googlelogin = await Googleauth.findOne({
    Email: email.toLowerCase(),
  });

  if (rec) {
    res.status(401).json({
      status: "failed",
      message: "user already found try to login",
    });
  }
  if (!user) {
    if (googlelogin) {
      createtoken(googlelogin, 201, res, req);
    } else {
      const googleuser = await Googleauth.create({
        Name: name,
        authId: authid,
        Email: email.toLowerCase(),
        Emailverified: emailverify,
        photo: photo,
        step: 0,
        completed: false,
      });

      createtoken(googleuser, 201, res, req);
    }
  } else {
    res.status(401).json({
      status: "failed",
      message: "user already found try to login",
    });
  }
};
