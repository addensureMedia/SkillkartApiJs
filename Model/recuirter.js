const mongoose = require("mongoose");

const ReModel = new mongoose.Schema({
  Name: String,
  Email: {
    type: String,
  },
  Emailverified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "recuirter", "admin"],
    default: "recuirter",
  },
  ipaddress: String,
  lastlogin: String,
  Password: {
    type: String,
  },
  phone: {
    type: String,
  },
  Gender: {
    type: String,
  },
  photo: {
    type: String,
  },
  Education: [
    {
      college: String,
      degree: String,
      stream: String,
      startingMonth: String,
      endMonth: String,
      startingYear: String,
      endYear: String,
    },
    ,
  ],
  Experience: [
    {
      designation: String,
      companyName: String,
      startingMonth: Number,
      endMonth: Number,
      startingYear: Number,
      endYear: Number,
    },
  ],
  Skills: [String],
  AOE: [String],
  specilization: [String],
  bio: {
    type: String,
  },
  qualification: {
    type: String,
  },
  pendingfeedback: {
    type: Boolean,
    default: false,
  },
  workat: {
    type: String,
  },
  currentrole: {
    type: String,
  },
  Linkendin: {
    type: String,
  },

  mentortype: {
    type: String,
  },
  step: {
    type: String,
  },
  compeleted: {
    type: Boolean,
    default: false,
  },
  step: {
    type: Number,
  },

  specilizationarea: {
    type: String,
  },
  NERE: {
    type: Boolean,
  },
  qualities: {
    type: String,
  },
  Rsparetime: {
    type: Boolean,
  },
  passwordResetToken: {
    type: String,
  },
  busydate: [
    {
      date: String,
      time: [String],
      index: Number,
      reschedule: {
        type: Number,
        default: 4,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Recuirtment = mongoose.model("Recuirter", ReModel);
module.exports = Recuirtment;
