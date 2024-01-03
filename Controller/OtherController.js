const Jobs = require("../Models/JobModel");
const Mentor = require("../Models/MentorModel");
const Referal = require("../Models/ReferalModel");

exports.siteJobs = async (req, res) => {
  const jobs = await Jobs.find();
  return res.status(200).json({
    status: "success",
    data: jobs,
  });
};

exports.addReferal = async (req, res) => {
  const { name, email, referedby, referid, phone, referername } = req.body;
  const existingReferral = await Referal.findOne({
    referedEmail: email.toLowerCase(),
  });
  if (!existingReferral) {
    const referralCode = await _checkIfHasreferal(9);
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} ${
      currentDate.getMonth() + 1
    } ${currentDate.getFullYear()}`;

    const newReferral = await Referal.create({
      refererid: referid,
      referedEmail: email,
      refererusername: referername,
      referedusername: name,
      referedbyEmail: referedby,
      refererphonenumber: phone,
      refercode: rcode,
      referedon: `${date} ${month} ${year}`,
    });

    const referralURL = `https://skillkart.app/refer?id=${referralCode}`;

    return res.status(200).json({
      status: "success",
    });
  } else {
    return res.status(400).json({
      status: "failed",
      message: "Already referred",
    });
  }
};

exports.getmentors = async (req, res) => {
  const mentor = await Mentor.find({
    compeleted: true,
  });
  return res.status(201).json({
    status: "success",
    data: mentor,
  });
};
