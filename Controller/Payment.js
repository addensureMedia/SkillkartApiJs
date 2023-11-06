const Referal = require("../Model/Referal");
const Transcation = require("../Model/Transaction");
const Razorpay = require("razorpay");

exports.payment = async (req, res) => {
  const { amount, email } = req.body;

  try {
    const instance = new Razorpay({
      key_id: process.env.r_key_id,
      key_secret: process.env.r_key_secret,
    });

    // Check if there is an unused referral within the last 3 days
    const refer = await Referal.findOne({
      referedEmail: email.toLowerCase(),
      used: false,
      referedon: {
        $gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    });

    // Calculate the payment amount based on referral and successful transactions
    const paymentAmount =
      refer && successfulTransactions === 0 ? 4999 * 100 : amount * 100;

    const options = {
      amount: paymentAmount,
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    instance.orders.create(options, function (err, order) {
      if (order) {
        return res.status(200).json({
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

exports.PaymentFail = async (req, res) => {
  const { user_id, course, price, username, r_id, email, date, status } =
    req.body;

  const requesteddata = await Transcation.create({
    user: user_id,
    user_name: username,
    course: course,
    price: price,
    status: status,
    razarpay_order_id: r_id,
  });
  res.status(400).json({
    status: "failed",
    message: "Transcation failed",
  });
};
