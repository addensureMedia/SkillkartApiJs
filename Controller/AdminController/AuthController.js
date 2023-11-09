const jwt = require("jsonwebtoken");
const Admin = require("../../Model/Admin/AdminModel");
const Recuirtment = require("../../Model/recuirter");
const User = require("../../Model/Usermodel");

const jsontoken = async (id) => {
  return jwt.sign({ data: id }, process.env.JWT_SECRETE, {
    expiresIn: "90d",
  });
};

const createtoken = async (user, statuscode, res, req) => {
  const token = await jsontoken(user._id);
  res.status(statuscode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.AdminLogin = async (req, res) => {
  const { Name, photoUrl, EmailVerified, email } = req.body;

  const user = await Admin.findOne({
    Email: email.toLowerCase(),
  });
  if (user) {
    if (user.completed) {
      createtoken(user, 201, res, req);
    } else {
      user.Name = Name;
      user.Emailverified = EmailVerified;
      user.completed = true;
      user.photo = photoUrl;
      await user.save();
      const token = await jsontoken(user._id);
      createtoken(user, 201, res, req);
    }
  } else {
    res.status(401).json({
      status: "Failed",
    });
  }
};

exports.isloggedIn = async (req, res) => {
  const token = req.header("Authorization");
  try {
    console.log(token);
    let decoded = await jwt.verify(token, process.env.JWT_SECRETE);
    const currentUser = await Admin.findById(decoded.data);
    console.log(currentUser);
    if (currentUser) {
      const students = await User.find();
      const mentors = await Recuirtment.find();
      res.status(201).json({
        status: "success",
        data: {
          students: students,
          mentors: mentors,
        },
      });
    } else {
      res.status(401).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
