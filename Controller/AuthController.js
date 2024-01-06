const Feedback = require("../Models/Feedback");
const Mentor = require("../Models/MentorModel");
const sessionModel = require("../Models/SessionModel");
const Transcation = require("../Models/Transcation");
const User = require("../Models/UserModel");
const {
  _handleOnboardingStudent,
  _handleOnboardingMentor,
} = require("../services/AuthService");
const Email = require("../services/EmailService");
const { createtoken, jsontoken } = require("../services/TokenCreation");
const bcrypt = require("bcrypt");

exports.isLoggedin = async (req, res, next) => {
  const user_id = req.user.data;

  const [student, mentor] = await Promise.all([
    User.findById(user_id),
    Mentor.findById(user_id),
  ]);

  if (student) {
    let hasActivePack;

    let sixtyDaysAgo = new Date();

    const transcations = await Transcation.find({
      user: student._id,
      status: "success",
    });

    const ActivePack = transcations.filter(
      (state) =>
        Math.floor(
          (new Date(state.createdAt) - new Date()) / (1000 * 60 * 60 * 24)
        ) <= 60
    );

    const [UserTrancation, userSession, sessionFeedback] = await Promise.all([
      Transcation.find({
        user: student._id,
      }),
      sessionModel.find({
        user: student._id,
      }),
      Feedback.find({ studentid: student._id }),
    ]);
    if (ActivePack.length) {
      hasActivePack = true;
    } else {
      hasActivePack = false;
    }
    return res.status(200).json({
      status: "success",
      data: student,
      meeting: userSession,
      feedback: sessionFeedback,
      ActivePack: ActivePack,
      transcation: UserTrancation,
      hasActivePack: hasActivePack,
    });
  }
  if (mentor) {
    const [userSession, sessionFeedback] = await Promise.all([
      sessionModel.find({
        recuiter: mentor._id,
      }),
      Feedback.find({ userid: mentor._id }),
    ]);
    return res.status(200).json({
      status: "success",
      data: mentor,
      meeting: userSession,
      feedback: sessionFeedback,
    });
  } else {
    return res.status(404).json({
      status: "Failed",
      message: "user not found",
    });
  }
};

exports.login = async (req, res, next) => {
  const clientIp = req.ip;
  const { email, password } = req.body;

  try {
    const [mentor, student] = await Promise.all([
      Mentor.findOne({ Email: email }),
      User.findOne({ Email: email }),
    ]);

    if (!mentor && !student) {
      return res.status(401).json({
        status: "Failed",
        message: "No account associated with this EmailId.",
      });
    }
    if (student) {
      const isPasswordValid = bcrypt.compare(password, student.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "Failed",
          message: "incorrect Email or Password",
        });
      }

      student.ipaddress = clientIp;
      await student.save();
      createtoken(student, 201, res, req);
    }
    if (mentor) {
      const isPasswordValid = bcrypt.compare(password, mentor.Password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "Failed",
          message: "incorrect Email or Password",
        });
      }

      mentor.ipaddress = clientIp;
      await mentor.save();
      createtoken(mentor, 201, res, req);
    }
  } catch (error) {
    return res.status(401).json({
      status: "failed",
    });
  }
};

exports.signup = async (req, res) => {
  const { username, email, phone, password } = req.body;
  const [isMentor, isUser] = await Promise.all([
    Mentor.findOne({
      Email: email.toLowerCase(),
    }),
    ,
    User.findOne({
      Email: email.toLowerCase(),
    }),
  ]);

  if (isMentor) {
    return res.status(401).json({
      status: "Failed",
      message: "Already had an account as a Recuiter.",
    });
  } else {
    console.log(isUser);
    if (isUser) {
      return res.status(401).json({
        status: "Failed",
        message: "Already had an account. Try to login.",
      });
    }
    const ecrpytedPassword = await bcrypt.hash(password, 15);
    const newUser = await User.create({
      Name: username,
      Email: email,
      password: ecrpytedPassword,
      phone: phone,
      completed: false,
    });
    let token = await jsontoken(newUser._id);
    new Email().welcomeUser(username, email);
    return res.status(201).json({
      status: "success",
      token,
      data: {
        newUser,
      },
    });
  }
};

exports.onBoarding = async (req, res) => {
  let decoded = req.user;

  const [hasUserAccount, hasMentorAccount] = await Promise.all([
    User.findById(decoded.data),
    Mentor.findById(decoded.data),
  ]);

  if (hasUserAccount) {
    if (hasUserAccount.completed) {
      return res.status(401).json({
        status: "Failed",
      });
    } else {
      hasUserAccount.completed = true;
      return _handleOnboardingStudent(
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
      return _handleOnboardingMentor(
        hasMentorAccount,
        hasMentorAccount.step,
        req,
        res
      );
    }
  }
};

exports.OnboardingTokenVerification = async (req, res, next) => {
  let decoded = req.user;
  const [user, mentor] = await Promise.all([
    User.findById(decoded.data),
    Mentor.findById(decoded.data),
  ]);

  if (user) {
    if (user.completed) {
      res.status(401).json({
        status: "failed",
        message: "Profile completed",
      });
    } else {
      return res.status(200).json({
        status: "success",
        data: { user },
      });
    }
  }
  if (mentor) {
    if (mentor.compeleted) {
      res.status(401).json({
        status: "failed",
        message: "Profile completed",
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
};

exports.EmailVerification = async (req, res) => {
  const { emailId } = req.query;

  try {
    const [hasRecruiterAccount, hasUserAccount] = await Promise.all([
      Mentor.findOne({ Email: emailId.toLowerCase() }),
      User.findOne({ Email: emailId.toLowerCase() }),
    ]);
    console.log(hasRecruiterAccount, hasUserAccount);

    if (hasRecruiterAccount) {
      return res.status(401).json({ status: "Failed" });
    } else if (hasUserAccount) {
      return res.status(401).json({ status: "Failed" });
    } else {
      return res.status(200).json({ status: "success" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "Error" });
  }
};

exports.BecomeaMentor = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const [hasStudentAccount, hasMentorAccount] = await Promise.all([
      User.findOne({ Email: email }),
      Mentor.findOne({ Email: email }),
    ]);

    if (hasStudentAccount || hasMentorAccount) {
      return res.status(400).json({
        status: "failed",
        message: existingUser
          ? "Already had an account as student"
          : "Already had an account",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 15);
    // const verifytoken = getRandomArbitrary(100000, 999999);

    const mentor = await Mentor.create({
      Name: name,
      Email: email,
      Password: hashedPassword,
      phone: phone,
    });
    new Email().welcomementor(name, email);
    let token = await jsontoken(mentor._id);
    let url = `https://skillkart.app/Account/mentor/onboarding/?Authorize_token=${token}`;
    setTimeout(() => {
      new Email().onBoardingMentor(name, email, url);
    }, 3000);
    return res.status(201).json({
      status: "success",
      token,
      data: {
        mentor,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred during mentor signup.",
    });
  }
};

exports.ForgetPassword = async (req, res) => {
  const email = req.query.emailId;

  const [user, Mentor] = await Promise.all([
    User.findOne({ Email: email }),
    Mentor.findOne({ Email: email }),
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
    // await new Email(token, Mentor.Name, Mentor.Email).passwordreset();
    return res.json({ token });
  } else {
    return res.status(401).json({
      status: "Failed",
      message: "No account associate with EmailId",
    });
  }
};
