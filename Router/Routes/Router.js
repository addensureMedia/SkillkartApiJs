const express = require("express");
const {
  sessionrequest,
  roomrequest,
  meetingdata,
  gettranscation,
  bookaslotdemo,
} = require("../../Controller/Bookingcontroller");
const router = express.Router();
const auth = require("../../Controller/Authcontroller");
const roomcrt = require("../../Controller/Roomcontroller");
const {
  userdata,
  mentor,
  getblog,
  allblogs,
  product,
} = require("../../Controller/allresponse");
const { upload } = require("../../Other/Multer");
const {
  secreatuser,
  getaccountdetail,
  getmessages,
  secretamessage,
  seenrqt,
  sislogin,
  userlogin,
  secretaphone,
} = require("../../Controller/Secretaapp");
const {
  postjobs,
  getjobs,
  Jobapply,
} = require("../../Controller/Jobcontroller");
const { adminjobpanel } = require("../../Controller/admincontroller");
const { performance } = require("../../Controller/dashboardcontroller");
const { Tempmail } = require("../../Controller/Mailsender");
const { googlesignup } = require("../../Controller/Googleauth");

// Auth routes
router.route("/isLoggedIn").post(auth.loggedin);
router.route("/signup").post(auth.signup);
router.route("/Login").post(auth.login);
router.route("/googlelogin").post(googlesignup);
router.route("/incompeleteformsubmission").post(auth.incompeleteform);

router.route("/roomcreation").post(roomrequest);

router.route("/mentorsignup").post(auth.mentosignup);
router
  .route("/mentoraccount")
  .post(auth.mentoraccountcr)
  .get(auth.getmformdetail);

router.route("/tknvrfy").post(auth.tknvrfy);
router.route("/mentortknvrfy").post(auth.mentortknvrfy);
router.route("/userdata").post(userdata);
router.route("/dateadder").post(auth.busydate);
router.route("/deleteroom").put(auth.deleteroom);
router.route("/roomverifiactio").post(auth.verifyroom);
router.route("/userforgeztpassword").post(auth.userforgetpass);
router.route("/feedbackdetail").post(auth.getfeedbackdetail);
router.route("/userdetail").post(auth.userdata);
router.get("/logout", auth.logout);
router.post("/feedback", auth.feedback);
router.post("/Editprofile", auth.Editprofile);
router.post("/meeting", meetingdata);
router.post("/gettranscation", gettranscation);
router.post("/createmsg", auth.createmsg);
router.post("/getmsg", auth.getmessage);
router.post("/deletemsg", auth.deleteroommsg);
router.post("/mentorform", auth.mentorfeedback);
router.post("/updateuserdetail", auth.updateroomdetail);
router.post("/pendingfeedbackstts", auth.pfee);
router.post("/razarpay", auth.payment);
router.post("/handlewaitinglist", auth.waitinglist);
router.post("/getmentors", auth.getmentors);
router.post("/purchase", auth.purchase);
router.post("/Mailer", roomcrt.mailer);
router.post("/subscribe", auth.subscribe);
router.post("/refer", auth.refer);
router.route("/getblog").get(allblogs).post(getblog);

router.post("/experiment", auth.demo);
router.post("/handletranctionfail", auth.transfail);
router.post("/bookaslot", auth.bookaslot);
router.get("/adminmentor", mentor);
router.post("/refer", auth.refer);
router.post("/referal", auth.referals);
router.get("/mentor", auth.mentor);
router.post("/usertranscation", auth.usertranscation);
router.post("/submitdate", auth.submitdate);
router.post("/getrounds", roomcrt.getrounds);
router.post("/handletranscation", auth.transcation);
router.post("/handleselectedmentor", auth.selectmentor);
router.post("/handlefeedback", auth.handlefeedback);
router.post("/resumehandle", auth.handleresume);
router.post("/getavafee", auth.avargefeedback);
router.post("/getresume", auth.getresume);
router.post("/verifyuemail", auth.uemail);
router.post("/passwordverify", auth.pverify);
router.post("/getfeedbacks", auth.getfeedbacks);
router.post("/getrevenue", auth.getrevenue);
router.get("/adminuserrecuirter", roomcrt.getuandr);
router.post("/isfeedbackdone", auth.isfeedback);
router.post("/reportaproblem", roomcrt.reportproblem);
router.post("/changeprofile", auth.changeprofilepic);
router.post("/removeprofilepic", auth.removeprofilepic);
router.post("/deactiveaccount", auth.deactive);
router.post("/changefronuserprofile", auth.change);
router.route("/refered").get(auth.getreferer).post(auth.addrefer);
router.route("/loginrefered").post(auth.addloginrefer);
router.route("/emailtest").post(auth.emailtest);
router.route("/changeuserprofiledetail").post(auth.changeuserprofile);
router.route("/changeuserpassword").post(auth.changeuserpassword);
router.route("/profilechangepassword").post(auth.profilechangepassword);
router.route("/deletslots").post(auth.deleteslots);
router.route("/getpendingfeedback").post(auth.getpendingfeedback);
router.route("/airesult").post(roomcrt.Aicalculation).get(roomcrt.getairesult);
router
  .route("/mentoremailverification")
  .post(auth.emailverification)
  .get(auth.emailverified);

router.route("/resmetest").post(roomcrt.resumetest);
router.route("/roomvideo").post(auth.roomvideo).get(auth.getroomvideo);
router.route("/getprducts").get(product);
router.route("/callrequest").post(auth.callrequest);
router.route("/getfeedbackreport").post(performance);
// Jobs
router.route("/adminjobpanel").get(adminjobpanel);
router.route("/jobs").post(postjobs).get(getjobs);
router.route("/applyjobs").post(Jobapply);

// mailurl

router.route("/mail/send").post(Tempmail);

////secreta links

router.route("/secretacreataccount").post(secreatuser);
router.route("/secretalogin").post(userlogin);
router.route("/secretaphoneupdate").post(secretaphone);
router.route("/secretagetacdetail").get(getaccountdetail);
router.route("/sendmessages").post(getmessages).get(secretamessage);
router.route("/seenrqt").get(seenrqt);
router.route("/secretislogin").post(sislogin);

module.exports = router;
