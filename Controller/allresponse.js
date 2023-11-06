const Blogs = require("../Model/BlogModel");
const Feedback = require("../Model/Feedback");
const PendingModel = require("../Model/Pendingfeedback");
const { Product } = require("../Model/Product");
const Recuirtment = require("../Model/recuirter");
const Referal = require("../Model/Referal");
const Raproblem = require("../Model/Reportaproblem");
const RoomModel = require("../Model/Roomcreation");
const RoomMessModel = require("../Model/Roommsg");
const Transcation = require("../Model/Transaction");
const User = require("../Model/Usermodel");
const Waitinglist = require("../Model/Waitinglis");

exports.userdata = async (req, res) => {
  const { email, role } = req.body;
  const response = await Recuirtment.findOne({
    Email: email,
  });

  res.status(200).json({
    data: response?.busydate,
  });
};

exports.mentor = async (req, res) => {
  const request = await Recuirtment.find();
  const room = await RoomModel.find();
  const user = await User.find();
  const waitinglist = await Waitinglist.find();
  const reportproblem = await Raproblem.find();
  const referal = await Referal.find();
  const pendingfee = await PendingModel.find();
  ``;
  const transcations = await Transcation.find();
  const feedback = await Feedback.find();
  res.status(200).json({
    status: "success",
    data: request,
    user: user,
    transcations: transcations,
    room: room,
    pendingfee: pendingfee,
    requestproblem: reportproblem,
    Waitingmember: waitinglist,
    Feedback: feedback,
    referal: referal,
  });
};

exports.getblog = async (req, res) => {
  const { id } = req.body;

  console.log(id);
  const request = await Blogs.findOne({ _id: id });
  console.log(request);
  res.status(200).json({
    status: "success",
    data: request,
  });
};

exports.getmentors = async (req, res) => {
  const mentor = await Recuirtment.find({
    compeleted: true,
  });
  return res.status(201).json({
    status: "success",
    data: mentor,
  });
  // const { user_id } = req.body;

  // const get = await RoomModel.findOne({
  //   user: user_id,
  //   status: "success",
  // });

  // if (get) {
  //   if (get.course_index > 1) {
  //     const request = await Recuirtment.findOne({
  //       _id: get.recuiter,
  //     });
  //     let d = new Date();
  //     let m = d.getMonth();
  //     let date = d.getDate();
  //     let array = [];

  //     let f = request.busydate.filter(
  //       (state) =>
  //         state.date.split(" ")[1] >= m + 1 && state.date.split(" ")[0] >= date
  //     );
  //     dispatchdates(f, array);

  //     res.status(200).json({
  //       status: "success",
  //       meeting: array,
  //     });
  //   } else {
  //     const request = await Recuirtment.find();
  //     let d = new Date();
  //     let m = d.getMonth();
  //     let date = d.getDate();
  //     let array = [];
  //     for (let i = 0; i < request.length; i++) {
  //       let f = request[i].busydate.filter(
  //         (state) =>
  //           state.date.split(" ")[1] >= m + 1 &&
  //           state.date.split(" ")[0] >= date
  //       );

  //       dispatchdates(f, array);
  //     }
  //     res.status(200).json({
  //       status: "success",
  //       meeting: array,
  //     });
  //   }
  // } else {
  //   res.status(400).json({
  //     status: "failed",
  //   });
  // }
};

exports.allblogs = async (req, res) => {
  const blogs = await Blogs.find();
  res.status(200).json({
    status: "success",
    data: blogs,
  });
};

exports.product = async (req, res) => {
  await Product.find()
    .then((result) => {
      res.status(200).json({
        status: "success",
        data: result,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
