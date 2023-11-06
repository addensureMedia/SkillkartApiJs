const Crypto = require("crypto");
const { promisify } = require("util");
const Feedback = require("../Model/Feedback");
const Recuirtment = require("../Model/recuirter");
const User = require("../Model/Usermodel");
const Email = require("../Other/Emailhandler");
const AccountEmail = require("../Other/AccountMails");

const RoomEmail = require("../Other/roomhandler");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const uuidv4 = require("uuidv4");
const AppError = require("../Other/Apperror");
const bcrypt = require("bcrypt");
const RoomModel = require("../Model/Roomcreation");
const Transcation = require("../Model/Transaction");
const { findByIdAndUpdate } = require("../Model/recuirter");
const RoomMessModel = require("../Model/Roommsg");
const { deleteMany } = require("../Model/Roommsg");
const PendingModel = require("../Model/Pendingfeedback");
const Razorpay = require("razorpay");
const Waitinglist = require("../Model/Waitinglis");
const Subscribe = require("../Model/Subscribe");
const Referal = require("../Model/Referal");
const RoomVideos = require("../Model/Roomvide");
const { Callrequest } = require("../Model/Callrequest");
const GoogleAuth = require("../Model/Googleauthuser");
const Googleauth = require("../Model/Googleauthuser");

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
const jsontoken = async (id) => {
  return jwt.sign({ data: id }, process.env.JWT_SECRETE, {
    expiresIn: "90d",
  });
};

const createtoken = async (user, statuscode, res, req, redirect) => {
  const token = await jsontoken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.status(statuscode).json({
    status: "success",
    token,
    redirect,
    data: {
      user,
    },
  });
};

exports.emailVerify = async (req, res) => {
  const { email } = req.body;

  try {
    const [hasRecruiterAccount, hasUserAccount] = await Promise.all([
      Recuirtment.findOne({ Email: email.toLowerCase() }),
      User.findOne({ Email: email.toLowerCase() }),
    ]);

    if (hasRecruiterAccount) {
      res.status(401).json({ status: "Failed" });
    } else if (hasUserAccount) {
      res.status(401).json({ status: "Failed" });
    } else {
      console.log("we are here now");
      res.status(200).json({ status: "success" });
    }
  } catch (error) {
    // Handle errors if needed
    console.error(error);
    return res.status(500).json({ status: "Error" });
  }
};

exports.signup = async (req, res) => {
  const { username, email, phone, password } = req.body;

  // Asynchronously query three different collections/models to check if a user with the provided email exists
  const [isRecuiteraccount, Googleaccount, UserExist] = await Promise.all([
    Recuirtment.findOne({
      Email: email.toLowerCase(),
    }),
    GoogleAuth.findOne({
      Email: email,
    }),
    User.findOne({
      Email: email.toLowerCase(),
    }),
  ]);

  // Check if a recruiter account already exists with the provided email
  if (isRecuiteraccount) {
    // Send a 401 Unauthorized response with a message
    res.status(401).json({
      status: "Failed",
      message: "Already had an account as a Recuiter.",
    });
  } else {
    // Check if an account associated with Google authentication exists with the provided email
    if (Googleaccount) {
      // Send a 401 Unauthorized response with a message
      res.status(401).json({
        status: "Failed",
        message: "Try to sign in with Google.",
      });
    } else {
      // Check if a regular user account with the provided email already exists
      if (UserExist) {
        // Send a 401 Unauthorized response with a message
        res.status(401).json({
          status: "Failed",
          message: "Already had an account. Try to login.",
        });
      } else {
        // Hash the provided password
        const ecrpyt = await bcrypt.hash(password, 15);

        // Create a new user record in the database
        const newuser = await User.create({
          Name: username,
          Email: email,
          password: ecrpyt,
          phone: phone,
          completed: false,
        });
        await new AccountEmail(username, email, "").WelcomeStudent();
        // Call a function to generate a token and send the response
        createtoken(newuser, 200, res, req, false);
      }
    }
  }
};

const handleOnboardingStudent = async (
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

const handleOnboardingMentor = async (mentor, step, req, res) => {
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

exports.onBoarding = async (req, res) => {
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(400).json({
        status: "Failed",
        message: "User is Logged out.",
      });
    }else{

    const decoded = jwt.verify(token, process.env.JWT_SECRETE);
    const [hasUserAccount, hasMentorAccount] = await Promise.all([
      User.findById(decoded.data),
      Recuirtment.findById(decoded.data),
    ]);

    if (hasUserAccount) {
      if (hasUserAccount.completed) {
        return res.status(401).json({
          status: "Failed",
        });
      } else {
        hasUserAccount.completed = true;
        return handleOnboardingStudent(
          hasUserAccount,
          req.body.info,
          req.body.photo,
          req.body.Linkedin,
          res
        );
      }
    }

    if (hasMentorAccount) {
      if (hasMentorAccount.compeleted) {
        return res.status(401).json({
          status: "Failed",
        });
      } else {
        return handleOnboardingMentor(
          hasMentorAccount,
          hasMentorAccount.step,
          req,
          res
        );
      }
    }
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      status: "Failed",
    });
  }
};

exports.OnboardingTokenVerification = async (req, res) => {
  const token = req.headers.authorization;
  try {
    // Check if a token is provided in the request body
    if (!token) {
      return res.status(400).json({
        status: "Failed",
        message: "User is Logged out.",
      });
    }

    // Verify the JWT token with the secret code
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);

    // Attempt to find the user with the decoded ID

    const [user, recuirter] = await Promise.all([
      await User.findById(decoded.data),
      await Recuirtment.findById(decoded.data),
    ]);

    if (user) {
      if (user.completed) {
        res.status(401).json({
          status: "failed",
        });
      } else {
        return res.status(200).json({
          status: "success",
          data: {
            user,
          },
        });
      }
    }
    if (recuirter) {
      if (recuirter.compeleted) {
        res.status(401).json({
          status: "failed",
        });
      } else {
        return res.status(200).json({
          status: "success",
          data: {
            user: recuirter,
          },
        });
      }
    }
  } catch (err) {
    res.status(401).json({
      status: "failed",
    });
  }
};

exports.PasswordReset = async (req, res) => {
  const token = req.headers.authorization;
  const { password } = req.body;
  try {
    if (!token) {
      return res.status(400).json({
        status: "Failed",
        message: "User is logged out.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRETE);

    const [user, recruiter] = await Promise.all([
      User.findById(decoded.data),
      Recuirtment.findById(decoded.data), // Corrected the model name
    ]);

    if (user) {
      const saltRounds = 15; // You can adjust the number of salt rounds as needed for your security requirements.

      const encryptedPassword = await bcrypt.hash(password, saltRounds);
      user.password = encryptedPassword;
      await user.save();
    } else if (recruiter) {
      const saltRounds = 15; // You can adjust the number of salt rounds as needed for your security requirements.
      const encryptedPassword = await bcrypt.hash(password, saltRounds);
      recruiter.Password = encryptedPassword;
      await recruiter.save();
    } else {
      return res.status(404).json({
        status: "Failed",
        message: "User not found.",
      });
    }

    res.status(200).json({
      status: "Success",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: "An error occurred while processing your request.",
    });
  }
};
exports.PasswordTokenVerification = async (req, res) => {
  const token = req.headers.authorization;
  try {
    // Check if a token is provided in the request body
    if (!token) {
      return res.status(400).json({
        status: "Failed",
        message: "User is Logged out.",
      });
    }

    // Verify the JWT token with the secret code
    const decode = jwt.verify(token, process.env.JWT_SECRETE);
    return res.status(201).json({
      status: "success",
    });
  } catch (err) {
    res.status(401).json({
      status: "failed",
    });
  }
};
exports.userforgetpass = async (req, res) => {
  const { email } = req.body;

  const [user, Mentor] = await Promise.all([
    User.findOne({ Email: email }),
    Recuirtment.findOne({ Email: email }),
  ]);

  if (user) {
    const token = jwt.sign({ data: user._id }, process.env.JWT_SECRETE, {
      expiresIn: "10m",
    });
    await new Email(token, user.Name, user.Email).passwordreset();
    return res.json({ token });
  }
  if (Mentor) {
    const token = jwt.sign({ data: Mentor._id }, process.env.JWT_SECRETE, {
      expiresIn: "10m",
    });
    await new Email(token, Mentor.Name, Mentor.Email).passwordreset();

    return res.json({ token });
  } else {
    return res.status(401).json({
      status: "Failed",
      message: "No account associate with EmailId",
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password, ipaddress, lastlogin } = req.body;

  try {
    const [rec, user] = await Promise.all([
      Recuirtment.findOne({ Email: email }),
      User.findOne({ Email: email }),
    ]);
    if (!rec && !user) {
      return res.status(401).json({
        status: "Failed",
        message: "No account associated with this EmailId.",
      });
    }

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "Failed",
          message: "incorrect Email or Password",
        });
      }

      user.ipaddress = ipaddress;
      user.lastlogin = lastlogin;
      await user.save();

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const trans = await Transcation.find({
        user: user._id,
        status: "success",
        createdAt: { $gte: sixtyDaysAgo },
      });

      createtoken(user, 201, res, req, trans.length > 0);
    }
    if (rec) {
      const isPasswordValid = await bcrypt.compare(password, rec.Password);

      if (!isPasswordValid) {
        return res.status(401).json({
          status: "Failed",
          message: "No account associated with this EmailId.",
        });
      }

      rec.ipaddress = ipaddress;
      rec.lastlogin = lastlogin;
      await rec.save();

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const trans = await Transcation.find({
        user: rec._id,
        status: "success",
        createdAt: { $gte: sixtyDaysAgo },
      });

      createtoken(rec, 201, res, req, trans.length > 0);
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(401).json({
      status: "failed",
    });
  }
};

exports.loggedin = async (req, res, next) => {
  const token = req.headers.authorization;

  try {
    // Check if a token is provided in the request body
    if (!token) {
      return res.status(400).json({
        status: "Failed",
        message: "User is Logged out.",
      });
    }

    // Verify the JWT token with the secret code
    const decoded = jwt.verify(token, process.env.JWT_SECRETE);

    // Attempt to find the user with the decoded ID
    let user =
      (await User.findById(decoded.data)) ||
      (await Recuirtment.findById(decoded.data)) ||
      (await GoogleAuth.findById(decoded.data));

    // If no user is found, return a 401 Unauthorized response
    if (!user) {
      return res.status(401).json({
        status: "Failed",
        message: "User not Found",
      });
    }
    const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const ActivePack = await Transcation.find({
        user: user._id,
        status: "success",
        createdAt: { $gte: sixtyDaysAgo },
      });

    // Find user session data
    const allTranscations= await Transcation.find()
    const userSession = await RoomModel.find();
    const feedback = await Feedback.find({ userid: decoded.data });

    let hasActivePack
    if(ActivePack.length){
      hasActivePack=true
    }else{
      hasActivePack=false
    }

    // Return a 200 OK response with user data and session information
    return res.status(200).json({
      status: "success",
      data: user,
      meeting: userSession,
      feedback: feedback,
      ActivePack:ActivePack,
      transcation:allTranscations,
      hasActivePack:hasActivePack
    });
  } catch (error) {
    return res.status(400).json({
      status: "Failed",
      message: "User is Logged out.",
    });
  }
};
exports.tknvrfy = async (req, res) => {
  const { email, tkn } = req.body;

  try {
    // Attempt to find a user with the provided email
    const user = await User.findOne({ Email: email });

    if (!user || !user.passwordResetToken) {
      // If the user doesn't exist or doesn't have a password reset token, return a 400 Bad Request response
      return res.status(400).json({
        status: "fail",
        message: "Invalid email or verification code.",
      });
    }

    if (user.passwordResetToken === tkn) {
      // If the provided token matches the user's token, mark the email as verified
      user.Emailverified = true;
      await user.save();

      // Return a 201 Created response with a success message
      return res.status(201).json({
        status: "success",
        message: "Email verification completed.",
      });
    }

    // If the provided token is incorrect, return a 401 Unauthorized response
    return res.status(401).json({
      status: "failed",
      message: "Incorrect verification code.",
    });
  } catch (error) {
    console.error(error);

    // Handle errors with a 500 Internal Server Error response
    return res.status(500).json({
      status: "error",
      message: "An error occurred while verifying the email.",
    });
  }
};

exports.mentosignup = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if a user or recruiter with the provided email already exists
    const existingUser = await User.findOne({ Email: email });
    const existingRecruiter = await Recuirtment.findOne({ Email: email });

    if (existingUser || existingRecruiter) {
      return res.status(400).json({
        status: "failed",
        message: existingUser
          ? "Already had an account as student"
          : "Already had an account",
      });
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 15);

    // Generate a verification token
    const verifytoken = getRandomArbitrary(100000, 999999);

    // Create a new mentor/recruiter
    const mentor = await Recuirtment.create({
      Name: name,
      Email: email,
      Password: hashedPassword,
      phone: phone,
    });

    // Create a JWT token for the mentor/recruiter
    createtoken(mentor, 201, res, req);

    // Send a welcome email with the verification token
    await new Email(verifytoken, name, email).welcomementor();

    return mentor;
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred during mentor signup.",
    });
  }
};

exports.deleteroom = async (req, res) => {
  const { roomid } = req.body;

  const Room = await RoomModel.findByIdAndDelete(roomid);

  res.status(200).json({
    status: "success",
  });
};

exports.getfeedbackdetail = async (req, res) => {
  const { roomid } = req.body;
  if (room_id.length >= 12) {
    const roomava = await Transcation.findOne({
      roomId: roomid,
    });

    if (roomava) {
      const user = await User.findById(roomava.U_id);
      const re = await Recuirtment.findById(roomava.recuiter_id);
      res.status(200).json({
        status: "success",
        user: user,
        rec: re,
      });
    } else {
      res.status(400).json({
        status: "fail",
      });
    }
  } else {
    res.status(400).json({
      status: "Fail",
    });
  }
};

exports.userdata = async (req, res) => {
  const { role, id } = req.body;
  if (id.length >= 12) {
    if (role == "recuirter") {
      const profile = await Recuirtment.findById(id);
      res.status(200).json({
        status: "success",
        data: profile,
      });
    } else {
      const profile = await User.findById(id);
      const roomparticipate = await RoomModel.findOne({
        recuiter_id: id,
      });
      const feedback = await Feedback.findOne({
        feedbackfor: id,
      });
      res.status(200).json({
        status: "success",
        data: profile,
        parties: roomparticipate,
        feedback: feedback,
      });
    }
  } else {
    res.status(400).json({
      status: "Fail",
    });
  }
};

exports.feedback = async (req, res) => {
  const { feedbackfor, by, feedbackinput, rating, roomid } = req.body;
  if (roomid.length >= 12) {
    const feedbcksrch = await Feedback.findOne({
      roomid: roomid,
    });
    if (!feedbcksrch) {
      const feedbackcreate = await Feedback.create({
        feedbackfor: feedbackfor,
        by: by,
        feedback: feedbackinput,
        rating: rating,
        roomid: roomid,
      });
      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(400).json({
        status: "Fail",
      });
    }
  } else {
    res.status(400).json({
      status: "Fail",
    });
  }
};

exports.mentortknvrfy = async (req, res) => {
  const { email, tkn } = req.body;
  const user = await Recuirtment.findOne({
    Email: email,
  });
  if (user.passwordResetToken) {
    if (user.passwordResetToken == tkn) {
      user.Emailverified = true;
      await user.save();
      res.status(201).json({
        status: "success",
      });
    }
  } else {
    res.status(401).json({
      status: "failed",
    });
  }
};

exports.Editprofile = async (req, res) => {
  const { id, name, phone, role, Currentrole, workat, AOE, qualification } =
    req.body;
  if (role == "user") {
    const user = await User.findById(id);
    user.Name = name;
    user.phone = phone;
    await user.save();
    res.status(200).json({
      status: "success",
      data: user,
    });
  }
  if (role == "recuirter") {
    const rec = await Recuirtment.findById(id);
    rec.Name = name;
    rec.phone = phone;
    rec.currentrole = Currentrole;
    rec.workat = workat;
    rec.AOE = AOE;
    rec.qualification = qualification;
    await rec.save();
    res.status(200).json({
      status: "success",
      data: rec,
    });
  }
};

// exports.busydate = async (req, res) => {
//   const { date, time, user_id, schdule, day } = req.body;
//   const data = await Recuirtment.findById({ _id: user_id });

//   const total_day_in_month = new Date(
//     new Date().getFullYear(),
//     parseInt(date.split(" ")[1]),
//     0
//   ).getDate();
//   let current_date = parseInt(date.split(" ")[0]);
//   let left_days = total_day_in_month - parseInt(date.split(" ")[0]);
//   if (schdule) {
//     if (left_days < 7) {
//       data.busydate.push({
//         date: `${current_date} ${date.split(" ")[1]} ${date.split(" ")[2]}`,
//         time: [time],
//         index: data.busydate.length,
//       });
//       await data.save();
//       res.status(200).json({
//         status: "success",
//         data: data,
//       });
//     } else {
//       let timeleft =
//         (total_day_in_month -
//           parseInt(current_date) -
//           ((total_day_in_month - parseInt(current_date)) % 7)) /
//         7;
//       console.log((31 - 2 - ((31 - 2) % 7)) / 7);
//       console.log(timeleft);
//       for (let d = 0; d < timeleft + 1; d++) {
//         const filter = data.busydate.filter(
//           (state) =>
//             state.date ==
//             `${parseInt(date.split(" ")[0]) + d * 7} ${date.split(" ")[1]} ${
//               date.split(" ")[2]
//             }`
//         );
//         if (filter.length) {
//           const clude = filter[0]?.time?.includes(time);
//           if (!clude) {
//             data.busydate[filter[0]?.index]?.time?.push(time);
//             await data.save();
//           } else {
//             continue;
//           }
//         } else {
//           data.busydate.push({
//             date: `${parseInt(date.split(" ")[0]) + d * 7} ${
//               date.split(" ")[1]
//             } ${date.split(" ")[2]}`,
//             time: [time],
//             index: data.busydate.length,
//           });
//         }
//       }

//       await data.save();
//       res.status(200).json({
//         status: "success",
//         data,
//       });
//     }
//   } else {
//     const filter = data.busydate.filter((state) => state.date == date);
//     if (filter.length) {
//       const clude = filter[0]?.time?.includes(time);
//       if (!clude) {
//         data.busydate[filter[0]?.index]?.time?.push(time);
//         await data.save();
//         res.status(200).json({
//           status: "success",
//           data: data,
//         });
//       } else {
//         res.status(400).json({
//           status: "FAILED",
//           message: "Change time slot",
//         });
//       }
//     } else {
//       data.busydate.push({
//         date: date,
//         time: [time],
//         index: data.busydate.length,
//       });
//       await data.save();

//       res.status(200).json({
//         status: "success",
//         data: data,
//         // updator,
//       });
//     }
//   }
// };

exports.busydate = async (req, res) => {
  const { date, time, user_id, schdule } = req.body;

  try {
    const data = await Recuirtment.findById(user_id);

    if (!data) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    const existingDate = data.busydate.find(
      (busyDate) => busyDate.date === date
    );

    if (existingDate) {
      if (existingDate.time.includes(time)) {
        return res.status(400).json({
          status: "failed",
          message: "Time slot is already marked as busy",
        });
      }
      existingDate.time.push(time);
    } else {
      data.busydate.push({
        date: date,
        time: [time],
      });
    }

    await data.save();

    return res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while updating busy dates",
    });
  }
};

exports.pendingFeedback = async (req, res) => {
  const { roomid, userid, time, date } = req.body;
  const re = await RoomModel.findOne({
    roomid: roomid,
  });
  const p = await PendingModel.findOne({
    roomid,
  });
  if (p) {
    res.status(200).json({
      status: "success",
    });
  } else {
    const request = await PendingModel.create({
      recuiter: userid,
      userid: re.user,
      roomid: roomid,
      date: date,
      time: time,
    });

    const recuit = await Recuirtment.findById(userid);
    recuit.pendingfeedback = true;
    await recuit.save();
    if (request) {
      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(400).json({
        status: "Failed",
      });
    }
  }
};
exports.mentorfeedback = async (req, res) => {
  const {
    EDB,
    CS,
    LISL,
    INSI,
    EAS,
    LA,
    EL,
    EIO,
    TM,
    TK,
    EONLNS,
    SH,
    CITA,
    AC,
    STLP,
    TSI,
    SU,
    OHI,
    tread,
    userid,
    roomid,
  } = req.body;
  const user = await Recuirtment.findById(userid);
  user.pendingfeedback = false;

  const request = await Feedback.create({
    EDB,
    CS,
    LISL,
    INSI,
    EAS,
    LA,
    EL,
    EIO,
    TM,
    TK,
    EONLNS,
    SH,
    CITA,
    AC,
    STLP,
    TSI,
    SU,
    OHI,
    tread,
    userid,
    roomid,
  });
  await user.save();
  const crequest = await RoomModel.findOne({
    roomid: roomid,
  });

  if (crequest) {
    const pfe = await PendingModel.findOneAndDelete({ roomid });
    request.compeleted = true;
    await crequest.save();
  }
  res.status(200).json({
    status: "success",
  });
};

function randomString(size = 8) {
  return Crypto.createHash("sha256").digest("hex").slice(0, size);
}

exports.updateroomdetail = async (req, res) => {
  const { roomid } = req.body;
  const request = await RoomModel.findOne({
    roomid: roomid,
  });

  if (request) {
    request.compeleted = true;
    res.status(200).json({
      status: "success",
    });
    await request.save();
  } else {
    res.status(400).json({
      status: "Failed",
    });
  }
};

exports.payment = async (req, res) => {
  const { amount, email } = req.body;

  const instance = new Razorpay({
    key_id: process.env.live_r_key_id,
    key_secret: process.env.live_r_key_secret,
  });

  const transcation = await Transcation.find({
    status: "success",
  });

  const refer = await Referal.findOne({
    referedEmail: email.toLowerCase(),
    used: false,
  });
  let options;

  if (refer) {
    let refered =
      Math.floor(
        (new Date().getTime() -
          new Date(
            `${refer.referedon.split(" ")[2]}-${
              refer.referedon.split(" ")[1]
            }-${refer.referedon.split(" ")[0]}`
          ).getTime()) /
          (1000 * 60 * 60 * 24)
      ) <= 3;
    if (refered) {
      options = {
        amount: 4999 * 100,
        currency: "INR",
        receipt: "order_rcptid_11",
      };
    } else {
      options = {
        amount: amount * 100,
        currency: "INR",
        receipt: "order_rcptid_11",
      };
    }
  } else {
    options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "order_rcptid_11",
    };
  }

  instance.orders.create(options, function (err, order) {
    if (order) {
      res.status(200).json({
        status: "success",
        data: order,
      });
    } else {
      res.status(400).json({
        status: "Failed",
      });
    }
  });
};

exports.waitinglist = async (req, res) => {
  const { name, email, phone } = req.body;
  const request = await Waitinglist.create({
    Name: name,
    Email: email,
    phone: phone,
  });
  res.status(200).json({
    status: "success",
  });
};

const dispatchdates = (f, array) => {
  for (let j = 0; j < f.length; j++) {
    if (f[j].time.length) {
      array.push(f[j]);
    } else {
      continue;
    }
  }
  return array;
};

const gtime = (item) => {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const nd = new Date(utc + 3600000 * 5.5);
  const hour = nd.getHours();
  const miu = nd.getMinutes();

  function gettime() {
    if (hour > 12) {
      return { time: hour - 12, zone: "PM" };
    } else {
      return {
        time: hour,
        zone: "AM",
      };
    }
  }

  let time = gettime();
  const filter = item.filter(
    (state) =>
      state.split(" ")[1] == time.zone &&
      state.split(" ")[0].split(":")[0] >= time.time
  );
  if (filter.length) {
    const index = item.indexOf(filter[0]);
    item.splice(index, 1);
    return filter[0];
  } else {
    return false;
  }
};
const searching = async (
  d,
  dnow,
  mnow,
  ynow,
  recuiter,
  user_id,
  course,
  price,
  username,
  email,
  date,
  index
) => {
  if (index < recuiter.length) {
    if (recuiter[index].pendingfeedback) {
      return searching(
        d,
        dnow,
        mnow,
        ynow,
        recuiter,
        user_id,
        course,
        price,
        username,
        email,
        date,
        index + 1
      );
    } else {
      if (recuiter[index].busydate.length) {
        const filter = recuiter[index].busydate.filter(
          (state) => state.date == `${dnow} ${mnow + 1} ${ynow}`
        );
        if (filter.length) {
          const time = gtime(recuiter[index].busydate[filter[0].index].time);
          if (!time) {
            return searching(
              d,
              dnow,
              mnow,
              ynow,
              recuiter,
              user_id,
              course,
              price,
              username,
              email,
              date,
              index + 1
            );
          } else {
            // const shift = recuiter[index].busydate[filter[0].index].time.shift();
            await recuiter[index].save();
            return {
              time: time,
              date: `${dnow} ${mnow + 1} ${ynow}`,
              recuiter: recuiter[index],
            };
          }
        } else {
          return searching(
            d,
            dnow,
            mnow,
            ynow,
            recuiter,
            user_id,
            course,
            price,
            username,
            email,
            date,
            index + 1
          );
        }
      } else {
        return searching(
          d,
          dnow,
          mnow,
          ynow,
          recuiter,
          user_id,
          course,
          price,
          username,
          email,
          date,
          index + 1
        );
      }
    }
  } else {
    return false;
  }
};

function randomString(size = 8) {
  return Crypto.createHash("sha256").digest("hex").slice(0, size);
}

const randomstringge = async () => {
  const rstring = await randomString();
  if (rstring) {
    const s = await RoomModel.findOne({
      roomid: rstring,
    });
    if (s) {
      return randomstringge();
    } else {
      return rstring;
    }
  } else {
    randomstringge();
  }
};
const rstring = (size = 8) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const rstringe = async () => {
  const sng = await rstring();
  if (sng) {
    const s = await RoomModel.findOne({
      roomid: sng,
    });
    if (s) {
      return rstring();
    } else {
      return sng;
    }
  } else {
    rstring();
  }
};

exports.demo = async (req, res) => {
  const cr = await bcrypt.hash("itsadminnotuser", 10);
};

exports.subscribe = async (req, res) => {
  const { email } = req.body;
  const s = await Subscribe.findOne({
    email: email,
  });
  if (s) {
    res.status(401).json({
      status: "Failed",
      message: "Already subscribed",
    });
  } else {
    const sc = await Subscribe.create({
      email: email,
    });

    res.status(200).json({
      status: "success",
      message: "Thank for your subscription",
    });
  }
};

exports.purchase = async (req, res) => {
  const { user_id, course, price, username, email, date, status } = req.body;
  let cat = ["Technical", "Technical", "Technical", "HR", "HR"];

  const refer = await Referal.findOne({
    referedEmail: email,
  });
  if (status == "Failed") {
    const requesteddata = await RoomModel.create({
      user: user_id,
      user_name: username,
      course: course,
      price: price,
      status: status,
    });
    res.status(400).json({
      status: "failed",
      message: "Transcation failed",
    });
  }
  if (status == "success") {
    const requesteddata = await RoomModel.create({
      user: user_id,
      user_name: username,
      course: course,
      course_index: 1,
      Course_cat: "Technical",
      price: price,
      status: status,
      roomid: "",
      time: "",
      date: "",
    });
    if (refer) {
      refer.used = true;
    } else {
      refer.used = false;
    }
    await refer.save();
    res.status(200).json({
      status: "Success",
      message: "successful",
    });
  }
};

const getindex = (t, time) => {
  const i = t.indexOf(time);
  t.slice(i, 1);
  return true;
};

const searchingslot = async (date, time, recuiter, index) => {
  if (index < recuiter.length) {
    const filter = recuiter[index].busydate.filter(
      (state) => state.date == date
    );
    if (filter.length) {
      const i = filter[0].time.includes(time);
      if (i) {
        const timef = getindex(
          recuiter[index].busydate[filter[0].index].time,
          time
        );
        await recuiter[index].save();
        return {
          time: time,
          date: date,
          recuiter: recuiter[index],
        };
      } else {
        return searchingslot(date, time, recuiter, index + 1);
      }
    } else {
      return searchingslot(date, time, recuiter, index + 1);
    }
  } else {
    return false;
  }
};
exports.bookaslot = async (req, res) => {
  let index = 0;
  const { time, user_id, date, email } = req.body;

  const recuiter = await Recuirtment.find();
  const slot = await searchingslot(date, time, recuiter, index);
  if (slot) {
    const string = await rstringe();
    const request = await RoomModel.findOne({
      user: user_id,
      status: "success",
    });
    request.time = slot.time;
    request.date = slot.date;
    request.recuiter = slot.recuiter._id;
    request.recuiter_name = slot.recuiter.Name;
    request.roomid = string;

    await request.save();
    const url = `https://skillkart.app/room/${string}`;

    await new RoomEmail(
      url,
      request.user_name,
      email,
      slot.time,
      slot.date
    ).send();
    await new RoomEmail(
      url,
      slot.recuiter.Name,
      slot.recuiter.Email,
      slot.time,
      slot.date
    ).send();
    res.status(200).json({
      status: "success",
      data: request,
    });
  } else {
    res.status(400).json({
      message: "something went wrong",
    });
  }
};

const refercode = async () => {
  const sng = await rstring();
  if (sng) {
    const s = await Referal.findOne({
      refercode: sng,
    });
    if (s) {
      return rstring();
    } else {
      return sng;
    }
  } else {
    return rstring();
  }
};
exports.refer = async (req, res) => {
  const { name, email, referedby, referid, phone, referername } = req.body;
  const exist = await Referal.findOne({
    referedEmail: email,
  });
  if (!exist) {
    const rcode = await refercode();
    let d = new Date();
    let date = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    const request = await Referal.create({
      refererid: referid,
      referedEmail: email,
      refererusername: referername,
      referedusername: name,
      referedbyEmail: referedby,
      refererphonenumber: phone,
      refercode: rcode,
      referedon: `${date} ${month} ${year}`,
    });
    const url = `https://skillkart.app/refer?id=${rcode}`;
    await new Email("", name, email, "", "", referername, url).referalprogram();
    res.status(200).json({
      status: "success",
    });
  } else {
    res.status(400).json({
      status: "failed",
      message: "already refered",
    });
  }
};

exports.referals = async (req, res) => {
  const { email } = req.body;
  const request = await Referal.find({
    referedbyEmail: email,
  });
  res.status(200).json({
    status: "success",
    data: request,
  });
};

exports.mentor = async (req, res) => {
  const mentor = await Recuirtment.find({
    pendingfeedback: false,
  });
  let date = new Date();

  let month = date.getMonth();
  let day = date.getDate();
  let array = [];
  for (let m of mentor) {
    const f = m.busydate.filter(
      (state) =>
        state.date.split(" ")[0] >= day &&
        state.date.split(" ")[1] >= month + 1 &&
        state.time.length > 0
    );
    if (f.length) {
      array.push(m);
    } else {
      continue;
    }
  }
  res.status(200).json({
    status: "success",
    data: array,
  });
};

exports.submitdate = async (req, res) => {
  const {
    recuiterid,
    userid,
    username,
    date,
    time,
    recuiter_name,
    round,
    user_email,
    recuiter_email,
    transid,
  } = req.body;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const tago = 1832454;
  const alreadyHasBooking = await RoomModel.findOne({
    round: round,
    transcationid: transid,
  });
  if (alreadyHasBooking) {
    if (alreadyHasBooking.reschedule <= 2) {
      const re = await Recuirtment.findOne({ _id: recuiterid });

      if (!re) {
        return res
          .status(400)
          .json({ status: "error", message: "Recruiter not found" });
      }

      const filter = re.busydate.find((state) => state.date === date);

      if (!filter) {
        return res.status(400).json({
          status: "error",
          message: "Date not found in recruiter's schedule",
        });
      }

      const indexOfDate = re.busydate.findIndex((state) => state.date == date);
      const isTimeTaken = filter.time.includes(time);
      getindex(re.busydate[indexOfDate].time, time);

      await re.save();
      if (!isTimeTaken) {
        return res
          .status(400)
          .json({ status: "error", message: "Time slot is already taken" });
      }

      const convertTo24Hour = (time) => {
        const [hour, minute] = time.split(" ")[0].split(":");
        if (time.includes("PM") && hour !== "12") {
          return `${parseInt(hour) + 12}:${minute}`;
        } else if (time.includes("AM") && hour === "12") {
          return `00:${minute}`;
        } else {
          return time.split(" ")[0];
        }
      };

      const time24Hour = convertTo24Hour(time);

      const dateStr = `${months[parseInt(date.split(" ")[1]) - 1]} ${
        date.split(" ")[0]
      }, ${date.split(" ")[2]} ${time24Hour}:00`;
      const scheduledTime = new Date(dateStr).getTime();
      const currentTime = new Date().getTime();

      if (scheduledTime - currentTime > tago) {
        setTimeout(async () => {
          await new RoomEmail(url, username, user_email, time, date).send();
          await new RoomEmail(
            url,
            recuiter_name,
            recuiter_email,
            time,
            date
          ).send();
        }, scheduledTime - currentTime);
      }

      const string = await rstringe();

      alreadyHasBooking.time = time;
      alreadyHasBooking.date = date;
      alreadyHasBooking.reschedule = alreadyHasBooking.reschedule + 1;
      await alreadyHasBooking.save();
      const url = `https://skillkart.app/room/${alreadyHasBooking.roomid}`;

      await new RoomEmail(url, username, user_email, time, date).send();
      await new RoomEmail(
        url,
        recuiter_name,
        recuiter_email,
        time,
        date
      ).send();

      res.status(200).json({
        status: "success",
        data: alreadyHasBooking,
      });
    } else {
      return res.status(401).json({
        status: "success",
        message: "extend all the limits",
      });
    }
  } else {
    const re = await Recuirtment.findOne({ _id: recuiterid });

    if (!re) {
      return res
        .status(400)
        .json({ status: "error", message: "Recruiter not found" });
    }

    const filter = re.busydate.find((state) => state.date === date);

    if (!filter) {
      return res.status(400).json({
        status: "error",
        message: "Date not found in recruiter's schedule",
      });
    }

    const indexOfDate = re.busydate.findIndex((state) => state.date == date);
    const isTimeTaken = filter.time.includes(time);
    getindex(re.busydate[indexOfDate].time, time);

    await re.save();
    if (!isTimeTaken) {
      return res
        .status(400)
        .json({ status: "error", message: "Time slot is already taken" });
    }

    const convertTo24Hour = (time) => {
      const [hour, minute] = time.split(" ")[0].split(":");
      if (time.includes("PM") && hour !== "12") {
        return `${parseInt(hour) + 12}:${minute}`;
      } else if (time.includes("AM") && hour === "12") {
        return `00:${minute}`;
      } else {
        return time.split(" ")[0];
      }
    };

    const time24Hour = convertTo24Hour(time);

    const dateStr = `${months[parseInt(date.split(" ")[1]) - 1]} ${
      date.split(" ")[0]
    }, ${date.split(" ")[2]} ${time24Hour}:00`;
    const scheduledTime = new Date(dateStr).getTime();
    const currentTime = new Date().getTime();

    if (scheduledTime - currentTime > tago) {
      setTimeout(async () => {
        await new RoomEmail(url, username, user_email, time, date).send();
        await new RoomEmail(
          url,
          recuiter_name,
          recuiter_email,
          time,
          date
        ).send();
      }, scheduledTime - currentTime);
    }

    const string = await rstringe();
    const roomcreation = await RoomModel.create({
      user: userid,
      recuiter: recuiterid,
      user_name: username,
      recuiter_name: recuiter_name,
      round: round,
      transcationid: transid,
      time: time,
      date: date,
      roomid: string,
    });

    const url = `https://skillkart.app/room/${string}`;

    await new RoomEmail(url, username, user_email, time, date).send();
    await new RoomEmail(url, recuiter_name, recuiter_email, time, date).send();

    res.status(200).json({
      status: "success",
      data: roomcreation,
    });
  }
};

exports.transcation = async (req, res) => {
  const {
    user_id,
    username,
    r_p_id,
    course_id,
    course,
    status,
    email,
    price,
    r_id,
    Purchasedate,
  } = req.body;

  const request = await Transcation.create({
    user: user_id,
    user_name: username,
    course: course,
    price,
    course_id: course_id,
    status,
    razarpay_order_id: r_id,
    razarpay_payment_id: r_p_id,
    Purchasedate,
  });
  const refer = await Referal.findOne({
    referedEmail: email,
    used: false,
  });
  if (refer) {
    refer.used = true;
    await refer.save();
    await new Email("", username, email, "", request._id).purchase();
    res.status(200).json({
      status: "success",
      request,
    });
  } else {
    await new Email("", username, email, "", request._id).purchase();
    res.status(200).json({
      status: "success",
      request,
    });
  }
};

exports.usertranscation = async (req, res) => {
  const { user_id } = req.body;
  const request = await Transcation.find({
    user: user_id,
  });

  res.status(200).json({
    status: "success",
    data: request,
  });
};

exports.selectmentor = async (req, res) => {
  let date = new Date();

  let month = date.getMonth();
  let day = date.getDate();
  const { recuit } = req.body;
  const f = await Recuirtment.findOne({
    _id: recuit,
  });
  if (f) {
    const fil = f.busydate.filter(
      (state) =>
        state.date.split(" ")[0] >= day &&
        state.date.split(" ")[1] >= month + 1 &&
        state.time.length > 0
    );

    if (fil.length) {
      res.status(200).json({
        status: "success",
        mentor: f,
        data: fil,
        slotfind: true,
      });
    } else {
      res.status(200).json({
        status: "success",
        mentor: f,
        data: fil,
        slotfind: false,
      });
    }
  } else {
    res.status(400).json({
      status: "Fail",
    });
  }
};

exports.handlefeedback = async (req, res) => {
  const { roomid } = req.body;
  const request = await Feedback.findOne({
    roomid,
  });
  res.status(200).json({
    status: "sucess",
    data: request,
  });
};

exports.avargefeedback = async (req, res) => {
  const { userid } = req.body;
  const request = await Feedback.find({
    userid,
  });
  if (request.length) {
    sum = 0;
    for (let c of request) {
      s = 0;
      for (let a of c) {
        console.log(c[a], a);
      }
    }
  } else {
    return;
  }
};

exports.handleresume = async (req, res) => {
  const { userid, round, username, transid } = req.body;
  const DIR = "../public/resume/";

  const alreadyUploaded = await RoomModel.findOne({
    round: round,
    transcationid: transid,
    user: userid,
  })
  console.log(alreadyUploaded)
  if(alreadyUploaded){
    return  res.status(200).json({
    status: "success",
  });
  }
  else{
    const mentor = await RoomModel.create({
      user: userid,
      compeleted: true,
      user_name: username,
      round: round,
      transcationid: transid,
      resume: `${userid}`,
    });
    res.status(200).json({
      status: "success",
    });
  }
};

exports.getresume = async (req, res) => {
  const { userid, transid } = req.body;
  const r = await RoomModel.findOne({
    user: userid,
    transcationid: transid,
    round: "Introduction",
  });
  if (r) {
    res.status(200).json({
      status: "success",
      data: r,
    });
  } else {
    res.status(400).json({
      status: "Failed",
    });
  }
};

const paswordrstring = (size) => {
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < size; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const passwordresettoken = async () => {
  const string = await paswordrstring(20);

  let usersearch = await User.find({
    passwordResetToken: string,
  });
  let recsearch = await Recuirtment.find({
    passwordResetToken: string,
  });

  if (!usersearch.length && !recsearch.length) {
    return string;
  } else {
    return passwordresettoken();
  }
};

exports.emailverification = async (req, res) => {
  const { email } = req.body;
  const rec = await Recuirtment.findOne({
    Email: email,
  });

  if (rec) {
    const verifytoken = await passwordresettoken();

    rec.passwordResetToken = verifytoken;
    await new Email(verifytoken, rec.Name, email).send();
    await rec.save();
    setTimeout(async () => {
      rec.passwordResetToken = "";
      await rec.save();
    }, 1000 * 600);
    res.status(200).json({
      status: "success",
    });
  } else {
    res.status(401).json({
      status: "Failed",
      messsage: "Didnt find any Accound associate with this Email.",
    });
  }
};

exports.emailverified = async (req, res) => {
  const { id } = req.query;

  const user = await User.findOne({
    passwordResetToken: id,
  });
  const rec = await Recuirtment.findOne({
    passwordResetToken: id,
  });
  if (user || rec) {
    if (user) {
      user.Emailverified = true;
      user.passwordResetToken = "";
      await user.save();
      res.status(200).json({
        status: "success",
      });
    }
    if (res) {
      rec.Emailverified = true;
      rec.passwordResetToken = "";
      await rec.save();
      res.status(200).json({
        status: "success",
      });
    }
  } else {
    res.status(400).json({
      status: "Fail",
    });
  }
};
exports.uemail = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({
    Email: email,
  });

  if (user) {
    const verifytoken = await passwordresettoken();
    user.passwordResetToken = verifytoken;
    await new Email(verifytoken, user.Name, email).passwordreset();
    await user.save();
    setTimeout(async () => {
      user.passwordResetToken = "";
      await user.save();
    }, 1000 * 600);
    res.status(200).json({
      status: "success",
    });
  } else {
    const rec = await Recuirtment.findOne({
      Email: email,
    });

    if (rec) {
      const verifytoken = await passwordresettoken();
      rec.passwordResetToken = verifytoken;
      await new Email(verifytoken, rec.Name, email).passwordreset();
      await rec.save();
      setTimeout(async () => {
        rec.passwordResetToken = "";
        await rec.save();
      }, 1000 * 600);
      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(401).json({
        status: "Failed",
        messsage: "Didnt find any Accound associate with this Email.",
      });
    }
  }
};

exports.pverify = async (req, res) => {
  const { email, password, code } = req.body;
  const user = await User.findOne({
    Email: email,
  });
  if (user) {
    if (user.passwordResetToken == code) {
      const ecrpt = await bcrypt.hash(password, 15);
      user.password = ecrpt;
      user.passwordResetToken = "";
      await user.save();
      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(400).json({
        status: "Failed",
        messsage: "Incorrect Code",
      });
    }
  } else {
    const rec = await Recuirtment.findOne({
      Email: email,
    });
    if (rec) {
      if (rec.passwordResetToken == code) {
        const ecrpt = await bcrypt.hash(password, 15);
        rec.Password = ecrpt;
        rec.passwordResetToken = "";
        await rec.save();
        res.status(200).json({
          status: "success",
        });
      } else {
        res.status(400).json({
          status: "Failed",
          messsage: "Incorrect Code",
        });
      }
    } else {
      res.status(401).json({
        status: "Failed",
        messsage: "Didnt find any Accound associate with this Email.",
      });
    }
  }
};

exports.getfeedbacks = async (req, res) => {
  const { user } = req.body;
  const request = await Feedback.find({
    userid: user,
  });
  res.status(200).json({
    status: "success",
    data: request,
  });
};

exports.getrevenue = async (req, res) => {
  const { user } = req.body;
  const request = await RoomModel.find({
    recuiter: user,
  });
  const feedback = await Feedback.find({
    userid: user,
  });
  let i = 0;
  for (let c of request) {
    const filter = feedback.filter((state) => state.roomid == c.roomid);
    if (filter.length) {
      i++;
    } else {
      continue;
    }
  }
  res.status(200).json({
    status: "success",
    data: i * 500,
  });
};

exports.isfeedback = async (req, res) => {
  const { roomid } = req.body;
  const request = await Feedback.findOne({
    roomid,
  });
  if (request) {
    res.status(200).json({
      status: "success",
      data: true,
    });
  } else {
    res.status(400).json({
      status: "success",
      data: false,
    });
  }
};

exports.isuserhasresume = async (req, res) => {
  const { userid } = req.body;

  const resume = await RoomModel.find({
    user: userid,
    round: "Introduction",
  }).sort({
    createdAt: -1,
  });

  const userdetail = await User.findOne({
    _id: userid,
  });
  res.status(200).json({
    status: "success",
    resume,
    data: userdetail,
  });
};

exports.changeprofilepic = async (req, res) => {
  const { userid, image } = req.body;
  const urequest = await User.findOne({
    _id: userid,
  });
  if (urequest) {
    urequest.photo = `${image}`;
    await urequest.save();
    res.status(200).json({
      status: "success",
    });
  } else {
    const rrequst = await Recuirtment.findOne({ _id: userid });
    if (rrequst) {
      rrequst.photo = `${image}`;
      await rrequst.save();
      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(400).json({
        status: "success",
      });
    }
  }
};

exports.removeprofilepic = async (req, res) => {
  const { userid } = req.body;
  const urequest = await User.findOne({
    _id: userid,
  });

  if (urequest) {
    urequest.photo = "";
    await urequest.save();
    res.status(200).json({
      status: "success",
    });
  } else {
    const rrequst = await Recuirtment.findOne({ _id: userid });
    if (rrequst) {
      rrequst.photo = "";
      await rrequst.save();
      res.status(200).json({
        status: "success",
      });
    } else {
      res.status(400).json({
        status: "success",
      });
    }
  }
};

exports.deactive = async (req, res) => {
  const { userid } = req.body;

  const request = await Recuirtment.findByIdAndDelete({
    _id: userid,
  });

  res.status(200).json({
    status: "sucess",
  });
};

exports.change = async (req, res) => {
  const { changeable, content, userid } = req.body;

  const user = await User.findOne({
    _id: userid,
  });
  if (user) {
    res.status(200).json({
      sttaus: "success",
    });
  } else {
    const request = await Recuirtment.findOne({
      _id: userid,
    });
    // request.Name=name,
    // request.Email =email,
    // request.bio=bio,
    // request.phone=phone,
    // request.Linkendin =linkedin,
    // request.workat = workat
    if (request) {
      if (changeable == "Name") {
        request.Name = content;
        await request.save();
        res.status(200).json({
          status: "success",
        });
      }
      if (changeable == "workat") {
        request.workat = content;
        await request.save();
        res.status(200).json({
          status: "success",
        });
      }
      if (changeable == "currentrole") {
        request.currentrole = content;
        await request.save();
        res.status(200).json({
          status: "success",
        });
      }
      if (changeable == "AOE") {
        request.AOE = content;
        await request.save();
        res.status(200).json({
          status: "success",
        });
      }
      if (changeable == "AOE") {
        request.AOE = content;
        await request.save();
        res.status(200).json({
          status: "success",
        });
      }
      if (changeable == "Linkendin") {
        request.Linkendin = content;
        await request.save();
        res.status(200).json({
          status: "success",
        });
      }
      if (changeable == "bio") {
        request.bio = content;
        await request.save();
        res.status(200).json({
          status: "success",
        });
      }
    }
  }
};

exports.getreferer = async (req, res) => {
  const { id } = req.query;
  const user = await Referal.findOne({
    refercode: id,
  });
  if (user) {
    res.status(200).json({
      status: "success",
      data: user,
    });
  } else {
    res.status(400).json({
      status: "Failed",
    });
  }
};

exports.addrefer = async (req, res) => {
  const { name, email, phone, password, refererid, referername, refereremail } =
    req.body;

  const r = await Referal.findOne({
    referedEmail: email,
  });
  const user = await User.findOne({
    Email: email,
  });

  if (!user) {
    if (r) {
      r.used = true;
      const ecrpt = await bcrypt.hash(password, 15);
      const verifytoken = getRandomArbitrary(100000, 999999);
      const newUser = await User.create({
        Name: name,
        Email: email,
        password: ecrpt,
        phone: phone,
        passwordResetToken: verifytoken,
      });

      createtoken(newUser, 201, res, req);
      await new Email("", name, email, "", "", referername).referalprogram();
      // await new Email(verifytoken, username, email, "VerifyEmail").send();
      await new Email(verifytoken, name, email, "VerifyEmail").welcomesend();
      await r.save();
      setTimeout(() => {
        newUser.passwordResetToken = "";
        newUser.save();
      }, 1000 * 300);
    } else {
      const ecrpt = await bcrypt.hash(password, 15);
      const verifytoken = getRandomArbitrary(100000, 999999);
      const newUser = await User.create({
        Name: name,
        Email: email,
        password: ecrpt,
        phone: phone,
        passwordResetToken: verifytoken,
      });

      createtoken(newUser, 201, res, req);
      await new Email("", name, email, "", "", referername).referalprogram();
      // await new Email(verifytoken, username, email, "VerifyEmail").send();
      await new Email(verifytoken, name, email, "VerifyEmail").welcomesend();
      await r.save();
      setTimeout(() => {
        newUser.passwordResetToken = "";
        newUser.save();
      }, 1000 * 300);
    }
  } else {
    res.status(400).json({
      status: "Failed",
      message: "Already Have an account.",
    });
  }
};

exports.addloginrefer = async (req, res, next) => {
  const { name, email, phone, password, refererid, referername, refereremail } =
    req.body;
  const user = await User.findOne({
    Email: email,
  });
  const rec = await Recuirtment.findOne({
    Email: email,
  });
  if (!user && !rec) {
    return next(
      new AppError("Didn't find associate with this EmailId.", 401, res)
    );
  }
  if (rec) {
    const dcrpt = await bcrypt.compare(password, rec.Password);
    if (!dcrpt) {
      return next(new AppError("Incorrect Email or password.", 401, res));
    } else {
      createtoken(rec, 201, res, req, true);
    }
  } else {
    const dcrpt = await bcrypt.compare(password, user.password);
    if (!dcrpt) {
      return next(new AppError("Incorrect Email or password.", 401, res));
    } else {
      const refer = await Referal.findOne({
        referedEmail: email.toLowerCase(),
        used: true,
      });
      if (refer) {
        new AppError("Already refered.", 401, res);
      } else {
        const r = await Referal.findOne({
          referedEmail: email.toLowerCase(),
        });
        if (r) {
          const trans = await Transcation.find({
            user: user._id,
            status: "success",
          });
          const transfilter = trans.filter(
            (state) =>
              Math.floor(
                (new Date().getTime() - new Date(state.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              ) < 60
          );
          if (transfilter.length) {
            if (!dcrpt) {
              return next(new AppError("Incorrect password.", 401, res));
            } else {
              createtoken(user, 201, res, req, true);
            }
          } else {
            createtoken(user, 201, res, req, false);
          }
        } else {
          const trans = await Transcation.find({
            user: user._id,
            status: "success",
          });
          const transfilter = trans.filter(
            (state) =>
              Math.floor(
                (new Date().getTime() - new Date(state.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              ) < 60
          );
          if (transfilter.length) {
            if (!dcrpt) {
              return next(new AppError("Incorrect password.", 401, res));
            } else {
              createtoken(user, 201, res, req, true);
            }
          } else {
            createtoken(user, 201, res, req, false);
          }
        }
      }
    }
  }
};

exports.emailtest = async (req, res) => {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const { date, time } = req.body;
  let tago = 1832454;
  if (time.split(" ")[1] == "AM") {
    let dates = `${months[parseInt(date.split(" ")[1]) - 1]} ${
      date.split(" ")[0]
    } , ${date.split(" ")[2]} ${time.split(" ")[0].split(":")[0]}:${
      time.split(" ")[0].split(":")[1]
    }:00`;
    const a = new Date().getTime();
    const d = new Date(dates);
    let ans = d - a;

    if (ans - tago > 0) {
      setTimeout(async () => {
        await new Email(
          "",
          "jagdeep",
          "jagdeepsnh57@gmail.com",
          "",
          "",
          "me"
        ).referalprogram();
      }, ans - tago);
    } else {
      setTimeout(async () => {
        await new Email(
          "",
          "jagdeep",
          "jagdeepsnh57@gmail.com",
          "",
          "",
          "me"
        ).referalprogram();
      }, ans - tago);
    }
  }
  if (time.split(" ")[1] == "PM") {
    let dates = `${months[parseInt(date.split(" ")[1]) - 1]} ${
      date.split(" ")[0]
    } , ${date.split(" ")[2]} ${
      parseInt(time.split(" ")[0].split(":")[0]) + 12
    }:${time.split(" ")[0].split(":")[1]}:00`;
    const d = new Date(dates);
    const a = new Date().getTime();
    let ans = d - a;
    if (ans - tago > 0) {
      setTimeout(async () => {
        console.log("yeah");
        await new Email(
          "",
          "jagdeep",
          "jagdeepsnh57@gmail.com",
          "",
          "",
          "me"
        ).referalprogram();
      }, ans - tago);
    } else {
      setTimeout(async () => {
        await new Email(
          "",
          "jagdeep",
          "jagdeepsnh57@gmail.com",
          "",
          "",
          "me"
        ).referalprogram();
      }, ans - tago);
    }
    // console.log(new Date().getTime() - tago);
  }
};

exports.mentoraccountcr = async (req, res) => {
  const { step } = req.query;
  const {
    name,
    email,
    phone,
    password,
    bio,
    linkedin,
    sAREA,
    specialization,
    qualification,
    gender,
    workat,
    currentrole,
    experience,
    mentorshiptype,
    joboffer,
    avatime,
    photo,
  } = req.body;

  const student = await User.findOne({
    Email: email,
  });
  if (student) {
    res.status(400).json({
      status: "Failed",
      message: "Already have an account as Student.",
    });
  } else {
    const user = await Recuirtment.findOne({ Email: email });
    if (user) {
      if (parseInt(step) === 2) {
        user.Gender = gender;
        user.photo = photo;
        user.bio = bio;
        user.Linkendin = linkedin;
        user.step = step;
        await user.save();
        res.status(200).json({
          status: "success",
          message: "Updated",
        });
      }
      if (parseInt(step) === 3) {
        user.AOE = sAREA;
        user.qualification = qualification;
        user.specilization = specialization;
        user.step = step;
        await user.save();
        res.status(200).json({
          status: "success",
        });
      }
      if (parseInt(step) === 4) {
        user.Experience = experience;
        user.workat = workat;
        user.currentrole = currentrole;
        user.step = step;
        await user.save();
        res.status(200).json({
          status: "success",
        });
      }
      if (parseInt(step) === 5) {
        user.mentortype = mentorshiptype;
        user.NERE = joboffer;
        user.Rsparetime = avatime;
        user.compeleted = true;
        user.step = step;

        await user.save();

        // await new Email("", user.Name, user.Email).welcomementor();

        setTimeout(async () => {
          await new Email("", user.Name, user.Email).welcome();
        }, 1000 * 15 * 60);

        res.status(200).json({
          status: "success",
        });
      }
    } else {
      const ecrpt = await bcrypt.hash(password, 15);
      const request = await Recuirtment.create({
        Name: name,
        Email: email,
        phone: phone,
        Password: ecrpt,
        photo: photo,
        step,
      });
      await new Email("", name, email).welcomementor();
      await new Email("", "", "").newmentorasyn();
      createtoken(request, 201, res, req);
    }
  }
};

exports.getmformdetail = async (req, res) => {
  const { token } = req.query;
  if (token) {
    try {
      const decoded = await jwt.verify(token, process.env.tokn_crypt);
      const currentUser = await Recuirtment.findById(decoded.data);
      if (currentUser) {
        const meeting = await RoomModel.find({
          recuiter: currentUser._id,
        });
        res.status(200).json({
          status: "success",
          data: currentUser,
          meeting: meeting,
        });
      } else {
        res.status(400).json({
          status: "Failed",
          message: "user not found",
        });
      }
    } catch {
      res.status(400).json({
        status: "Fail",
        message: "Token expire",
      });
    }
  }
};

exports.changeuserprofile = async (req, res) => {
  const { name, phone, usermail } = req.body;

  const rec = await Recuirtment.findOne({ Email: usermail });

  if (rec) {
    res.status(400).json({
      status: "Fail",
      message: "Email already registered.",
    });
  } else {
    const user = await User.findOne({
      Email: usermail,
    });
    if (user) {
      user.Name = name;
      user.phone = phone;
      await user.save();
      res.status(200).json({
        status: "success",
        data: user,
      });
    } else {
      res.status(400).json({
        status: "Failed",
        message: "User not Found",
      });
    }
  }
};

exports.changeuserpassword = async (req, res) => {
  const { email, currentpass, newpass } = req.body;

  const user = await User.findOne({
    Email: email,
  });
  if (user) {
    const dcrpt = await bcrypt.compare(currentpass, user.password);
    if (dcrpt) {
      const ecrpt = await bcrypt.hash(currentpass, 10);
      user.password = ecrpt;
      await user.save();
      res.status(200).json({
        status: "success",
        message: "Password changes successfully",
      });
    } else {
      res.status(400).json({
        status: "Fail",
        message: "Wrong password",
      });
    }
  } else {
    res.status(401).json({
      status: "Fail",
      message: "Wrong user",
    });
  }
};

exports.deleteslots = async (req, res) => {
  const { userid, date, time } = req.body;
  console.log(userid, date, time);
  const re = await Recuirtment.findById(userid);
  const filter = re.busydate.filter((state) => state.date == date);
  if (filter.length) {
    const i = filter[0].time.includes(time);
    if (i) {
      const timef = getindex(re.busydate[filter[0].index].time, time);
      console.log(timef);
      await re.save();
      res.status(200).json({
        status: "success",
        data: re,
      });
    }
  }
};

exports.getpendingfeedback = async (req, res) => {
  const { userid } = req.body;
  console.log(userid);
  const room = await PendingModel.find({
    recuiter: userid,
  });

  let arr = [];
  if (room) {
    for (let user of room) {
      const request = await User.findOne({
        _id: user.userid,
      });
      if (request) {
        arr.push({
          room: user,
          user: {
            name: request.Name,
            photo: request.photo,
            email: request.Email,
          },
        });
      }
    }
    res.status(200).json({
      status: "success",
      data: arr,
    });
  } else {
    res.status(400).json({
      status: "Fail",
      message: "Feedbacks not found",
    });
  }
};

exports.roomvideo = async (req, res) => {
  const { userid, recuiter, roomid, video } = req.body;

  // console.log(userid, recuiter, roomid, video);
  await RoomVideos.create({
    user: userid,
    recuiter: recuiter,
    roomid,
    video,
  }).then(() => {
    res.status(200).json({
      status: "sucess",
    });
  });
};

exports.getroomvideo = async (req, res) => {
  // const { userid, recuiter, roomid, video } = req.body;

  const video = await RoomVideos.find();
  res.status(200).json({
    status: "success",
    data: video,
  });
};

exports.callrequest = async (req, res) => {
  const { phonenumber } = req.body;
  await Callrequest.create({
    phonenumber: phonenumber,
  });
  res.status(200).json({
    status: "success",
  });
};

exports.profilechangepassword = async (req, res) => {
  const { role, email, password } = req.body;
  console.log(role, email, password);

  const user = await User.findOne({
    Email: email,
  });
  console.log(user);
  if (user) {
    const ecrpyt = await bcrypt.hash(password, 15);
    user.password = ecrpyt;
    await user.save();
    res.status(200).json({
      status: "success",
    });
  } else {
    const rec = await Recuirtment.findOne({
      Email: email,
    });
    console.log(rec);
    const ecrpyt = await bcrypt.hash(password, 15);
    console.log(ecrpyt);
    rec.Password = ecrpyt;
    await rec.save();
    res.status(200).json({
      status: "success",
    });
  }
};
