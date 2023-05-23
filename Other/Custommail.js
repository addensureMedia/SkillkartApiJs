const nodemailer = require("nodemailer");
const ejs = require("ejs");
const htmlToText = require("html-to-text");

module.exports = class Custommail {
  constructor(subject, mailto, cc) {
    (this.subject = subject), (this.mailto = mailto), (this.cc = cc);
  }
  mailtransporter() {
    return nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 587,
      auth: {
        user: "info@skillkart.app",
        pass: "Ashwani@1",
      },
    });
  }

  async Customemail() {}
};
