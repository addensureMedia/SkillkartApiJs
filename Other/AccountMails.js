const nodemailer = require("nodemailer");
const ejs = require("ejs");
const htmlToText = require("html-to-text");

module.exports = class AccountEmail {
  constructor(email, username, url) {
    this.email = email;
    this.username = username;
    this.url = url;
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
  async WelcomeStudent() {
    const html = await ejs.renderFile(
      `${__dirname}/../views/Emails/WelcomeStudent.ejs`,
      {
        username: this.username,
      }
    );

    let detail = {
      from: "info@skillkart.app",
      to: this.email,
      subject: "Now Be job ready in 30 days",
      html,
      text: htmlToText.compile(html),
    };
    await this.mailtransporter().sendMail(detail, (error, info) => {
      console.log(error);
      console.log(info);
    });
  }
};
