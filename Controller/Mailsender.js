const Recuirtment = require("../Model/recuirter");
const Email = require("../Other/Emailhandler");

exports.Tempmail = async (req, res) => {
  const { subject, mailto, cc } = req.body;
};

exports.RequestForSlot = async (req, res) => {
  const { recuiterid } = req.body;

  const request = await Recuirtment.findById(recuiterid);
  if (request) {
    await new Email("", request.Name, request.Email).RequestFormail();
    res.status(200).json({
      status: "success",
    });
  }
};
