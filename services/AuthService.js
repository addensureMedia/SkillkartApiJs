const Referal = require("../Models/ReferalModel");

exports._handleOnboardingStudent = async (
  student,
  education,
  photo,
  linkedin,
  res
) => {
  student.Education = education;
  student.Linkedinprofile = linkedin;
  student.photo = photo;
  await student.save();
  res.status(201).json({
    status: "success",
  });
};

exports._handleOnboardingMentor = async (mentor, step, req, res) => {
  switch (step) {
    case 1:
      mentor.Linkedin = req.body.Linkedin;
      mentor.Skills = req.body.skills;
      mentor.specilization = req.body.specialization;
      mentor.AOE = req.body.areaOfExpertise;
      mentor.Experience = req.body.info;
      mentor.step = 2;
      console.log(1);
      break; // Add a break statement to exit the switch case

    case 2:
      mentor.mentortype = req.body.mentortype;
      mentor.Rsparetime = req.body.haveSpareTime;
      mentor.NERE = req.body.recuiteStudent;
      mentor.compeleted = true;
      break; // Add a break statement to exit the switch case

    default:
      mentor.Education = req.body.info;
      mentor.bio = req.body.bio;
      mentor.photo = req.body.photo;
      mentor.step = 1;
  }

  await mentor.save();
  console.log("done");
  return res.status(201).json({
    status: "success",
    data: {
      user: mentor,
    },
  });
};

exports._randomStringGenerator = (size) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

exports._checkIfHasreferal = async (length) => {
  const _randomString = _randomStringGenerator(length);
  if (_randomString) {
    const hasvouncher = await Referal.findOne({
      refercode: _randomString,
    });
    if (hasvouncher) {
      return rstring();
    } else {
      return _randomString;
    }
  } else {
    return rstring();
  }
};
