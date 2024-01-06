const Email = require("../services/EmailService")

exports.testMail=async(req, res)=>{
    // new Email().welcomementor("jagdeep", "jagdeepsnh57@gmail.com")
    new Email().onBoardingMentor("jagdeep", "jagdeepsnh57@gmail.com")
    // new Email().requestForSlot("jagdeep", "jagdeepsnh57@gmail.com")
}