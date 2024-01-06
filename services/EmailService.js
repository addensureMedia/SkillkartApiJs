const nodemailer = require("nodemailer");
const ejs = require("ejs");
const htmlToText = require("html-to-text");
module.exports = class Email {
  constructor() {}

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

  async welcomeUser(username, email) {
    console.log(`${__dirname}/../Template/welcomeStudent.ejs`);
    const html = await ejs.renderFile(
      `${__dirname}/../Template/welcomeStudent.ejs`,
      {
        username: username,
      }
    );

    let detail = {
      from: "info@skillkart.app",
      to: email,
      subject: `Welcome ${
        username.split(" ")[0]
      } to Skillkart, your AI-enabled Interview Preparation platform and mentor! 🚀`,
      html,
      text: htmlToText.compile(html),
    };
    await this.mailtransporter().sendMail(detail, (error, info) => {
      console.log(error);
      console.log(info);
    });
  }

  async welcomementor(username, email) {
    console.log(`${__dirname}/../Template/Welcomementor.ejs`);
    const html = await ejs.renderFile(
      `${__dirname}/../Template/Welcomementor.ejs`,
      {
        username: username,
      }
    );

    let detail = {
      from: "info@skillkart.app",
      to: email,
      subject: `Welcome ${
        username.split(" ")[0]
      } to Skillkart an AI enabled -Interview Preperation platform`,
      html,
      text: htmlToText.compile(html),
    };
    await this.mailtransporter().sendMail(detail, (error, info) => {
      console.log(error);
      console.log(info);
    });
  }
  async onBoardingMentor(username, email, url) {
    console.log(`${__dirname}/../Template/MentorOnboarding.ejs`);
    const html = await ejs.renderFile(
      `${__dirname}/../Template/MentorOnboarding.ejs`,
      {
        username: username,
        url: url,
      }
    );

    let detail = {
      from: "info@skillkart.app",
      to: email,
      subject: `Complete Your Skillkart Mentor Onboarding: Action Required 🚀`,
      html,
      text: htmlToText.compile(html),
    };
    await this.mailtransporter().sendMail(detail, (error, info) => {
      console.log(error);
      console.log(info);
    });
  }

  async PaymentSucessfull(username, email, productname, productprice) {
    console.log(`${__dirname}/../Template/PaymentSuccess.ejs`);
    const html = await ejs.renderFile(
      `${__dirname}/../Template/PaymentSuccess.ejs`,
      {
        username: username,
        productname: productname,
        productprice: productprice,
      }
    );

    let detail = {
      from: "info@skillkart.app",
      to: email,
      subject: `🎉 Payment Successful! `,
      html,
      text: htmlToText.compile(html),
    };
    await this.mailtransporter().sendMail(detail, (error, info) => {
      console.log(error);
      console.log(info);
    });
  }
  async PaymentFailure(username, email, productname) {
    console.log(`${__dirname}/../Template/PaymentFail.ejs`);
    const html = await ejs.renderFile(
      `${__dirname}/../Template/PaymentFail.ejs`,
      {
        username: username,
        productname: productname,
      }
    );

    let detail = {
      from: "info@skillkart.app",
      to: email,
      subject: `Payment Failed - Action Required for Your Skillkart Subscription`,
      html,
      text: htmlToText.compile(html),
    };
    await this.mailtransporter().sendMail(detail, (error, info) => {
      console.log(error);
      console.log(info);
    });
  }

  async slotConfirmForStudent(username, email, url, roomdetail) {
    console.log(`${__dirname}/../Template/SessionBooking.ejs`);
    const html = await ejs.renderFile(
      `${__dirname}/../Template/SessionBooking.ejs`,
      {
        username: username,
        url: url,
        roomDate: roomdetail.date,
        roomTime: roomdetail.time,
      }
    );

    let detail = {
      from: "info@skillkart.app",
      to: email,
      subject: `Your Scheduled Interview Room Awaits!`,
      html,
      text: htmlToText.compile(html),
    };
    await this.mailtransporter().sendMail(detail, (error, info) => {
      console.log(error);
      console.log(info);
    });
  }

  async requestForSlot(username, email) {
    console.log(`${__dirname}/../Template/Welcomementor.ejs`);
    const html = await ejs.renderFile(
      `${__dirname}/../Template/RequestForSlot.ejs`,
      {
        username: username,
      }
    );

    let detail = {
      from: "info@skillkart.app",
      to: email,
      subject: `Request for Additional Session Slots`,
      html,
      text: htmlToText.compile(html),
    };
    await this.mailtransporter().sendMail(detail, (error, info) => {
      console.log(error);
      console.log(info);
    });
  }
};
