const User = require("../Model/Usermodel");
const Feedback = require("../Model/Feedback");
const RoomModel = require("../Model/Roomcreation");

exports.performance = async (req, res) => {
  //   const { userid  , transid} = req.body;

  let userid = "63e720bb63c2d7bfbd3b653f";
  let tranid = "63bec23764de8c4257fc35b0";

  const getsessiondone = await RoomModel.find({
    user: userid,
    transcationid: tranid,
    compeleted: true,
  });

  for (let session of getsessiondone) {
    console.log(session , );
  }
  // console.log(getsessiondone);
};
