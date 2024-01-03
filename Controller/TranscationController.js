const Referal = require("../Models/ReferalModel");
const Razorpay = require("razorpay");
const Transcation = require("../Models/Transcation");

exports.Payment = async (req, res, next) => {
  const { amount, email } = req.body;

  try {
    const instance = new Razorpay({
      key_id: process.env.r_key_id,
      key_secret: process.env.r_key_secret,
    });

    const refer = await Referal.findOne({
      referedEmail: email.toLowerCase(),
      used: false,
      referedon: {
        $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    });

    const paymentAmount =
      refer && successfulTransactions === 0 ? 4999 * 100 : amount * 100;

    const options = {
      amount: paymentAmount,
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    instance.orders.create(options, function (err, order) {
      if (order) {
        return res.status(201).json({
          status: "success",
          data: order,
        });
      } else {
        return res.status(400).json({
          status: "Failed",
        });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while processing the payment.",
    });
  }
};

exports.SuccessTranscation = async (req, res) => {
  const {
    user_id,
    username,
    payment_id,
    course_id,
    course,
    status,
    email,
    price,
    order_id,
    Purchasedate,
  } = req.body;

  const request = await Transcation.create({
    user: user_id,
    user_name: username,
    course: course,
    price,
    course_id: course_id,
    status,
    order_id: order_id,
    payment_id: payment_id,
    Purchasedate,
  });
  const referer = await Referal.findOne({
    referedEmail: email,
    used: false,
  });
  if (referer) {
    referer.used = true;
    await referer.save();
    return res.status(200).json({
      status: "success",
      request,
    });
  } else {
    return res.status(200).json({
      status: "success",
      request,
    });
  }
};
