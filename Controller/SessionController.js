const Mentor = require("../Models/MentorModel");
const Roomai = require("../Models/Roomai");
const sessionModel = require("../Models/SessionModel");
const { _randomStringGenerator } = require("../services/AuthService");

exports.slotManager = async (req, res) => {
  const { date, time, user_id, schdule } = req.body;

  try {
    const data = await Mentor.findById(user_id);

    if (!data) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    const existingDate = data.busydate.find(
      (busyDate) => busyDate.date === date
    );

    if (existingDate) {
      if (existingDate.time.includes(time)) {
        return res.status(400).json({
          status: "failed",
          message: "Time slot is already marked as busy",
        });
      }
      existingDate.time.push(time);
    } else {
      data.busydate.push({
        date: date,
        time: [time],
      });
    }

    await data.save();
    return res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "An error occurred while updating busy dates",
    });
  }
};

const getindex = (t, time) => {
  const i = t.indexOf(time);
  t.splice(i, 1);
  return true;
};

exports.removeSlot = async (req, res) => {
  const { userid, date, time } = req.body;
  const mentor = await Mentor.findById(userid);
  const occupiedDates = mentor.busydate.filter(
    (state) => state.date == date
  )[0];

  const getIndexOfDate = mentor.busydate.findIndex(
    (state) => state.date === date
  );

  if (occupiedDates) {
    if (occupiedDates.time.includes(time)) {
      console.log(mentor.busydate[getIndexOfDate].time, time);
      console.log(getindex(mentor.busydate[getIndexOfDate].time, time));
      await mentor.save();
      return res.status(200).json({
        status: "success",
        data: mentor,
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "slot didnt found",
      });
    }
  } else {
    return res.status(400).json({
      status: "fail",
      message: "slot didnt found",
    });
  }
};

exports._sessionBooking = async (req, res, next) => {
  const {
    recuiterid,
    userid,
    username,
    date,
    time,
    recuiter_name,
    round,
    user_email,
    recuiter_email,
    transid,
  } = req.body;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const tago = 1832454;
  const alreadyHasBooking = await sessionModel.findOne({
    round: round,
    transcationid: transid,
  });
  if (alreadyHasBooking) {
    if (alreadyHasBooking.reschedule <= 2) {
      const re = await Mentor.findOne({ _id: recuiterid });

      if (!re) {
        return res
          .status(400)
          .json({ status: "error", message: "Recruiter not found" });
      }

      const filter = re.busydate.find((state) => state.date === date);

      if (!filter) {
        return res.status(400).json({
          status: "error",
          message: "Date not found in recruiter's schedule",
        });
      }

      const indexOfDate = re.busydate.findIndex((state) => state.date == date);
      const isTimeTaken = filter.time.includes(time);
      getindex(re.busydate[indexOfDate].time, time);

      await re.save();
      if (!isTimeTaken) {
        return res
          .status(400)
          .json({ status: "error", message: "Time slot is already taken" });
      }

      const convertTo24Hour = (time) => {
        const [hour, minute] = time.split(" ")[0].split(":");
        if (time.includes("PM") && hour !== "12") {
          return `${parseInt(hour) + 12}:${minute}`;
        } else if (time.includes("AM") && hour === "12") {
          return `00:${minute}`;
        } else {
          return time.split(" ")[0];
        }
      };

      const time24Hour = convertTo24Hour(time);

      const dateStr = `${months[parseInt(date.split(" ")[1]) - 1]} ${
        date.split(" ")[0]
      }, ${date.split(" ")[2]} ${time24Hour}:00`;
      const scheduledTime = new Date(dateStr).getTime();
      const currentTime = new Date().getTime();

      if (scheduledTime - currentTime > tago) {
        setTimeout(async () => {
          // await new RoomEmail(url, username, user_email, time, date).send();
          // await new RoomEmail(
          //   url,
          //   recuiter_name,
          //   recuiter_email,
          //   time,
          //   date
          // ).send();
        }, scheduledTime - currentTime);
      }

      const string = await _randomStringGenerator(8);

      alreadyHasBooking.time = time;
      alreadyHasBooking.date = date;
      alreadyHasBooking.reschedule = alreadyHasBooking.reschedule + 1;
      await alreadyHasBooking.save();
      const url = `https://skillkart.app/room/${alreadyHasBooking.roomid}`;

      // await new RoomEmail(url, username, user_email, time, date).send();
      // await new RoomEmail(
      //   url,
      //   recuiter_name,
      //   recuiter_email,
      //   time,
      //   date
      // ).send();

      res.status(200).json({
        status: "success",
        data: alreadyHasBooking,
      });
    } else {
      return res.status(401).json({
        status: "success",
        message: "extend all the limits",
      });
    }
  } else {
    const re = await Mentor.findOne({ _id: recuiterid });

    if (!re) {
      return res
        .status(400)
        .json({ status: "error", message: "Recruiter not found" });
    }

    const filter = re.busydate.find((state) => state.date === date);

    if (!filter) {
      return res.status(400).json({
        status: "error",
        message: "Date not found in recruiter's schedule",
      });
    }

    const indexOfDate = re.busydate.findIndex((state) => state.date == date);
    const isTimeTaken = filter.time.includes(time);
    getindex(re.busydate[indexOfDate].time, time);

    await re.save();
    if (!isTimeTaken) {
      return res
        .status(400)
        .json({ status: "error", message: "Time slot is already taken" });
    }

    const convertTo24Hour = (time) => {
      const [hour, minute] = time.split(" ")[0].split(":");
      if (time.includes("PM") && hour !== "12") {
        return `${parseInt(hour) + 12}:${minute}`;
      } else if (time.includes("AM") && hour === "12") {
        return `00:${minute}`;
      } else {
        return time.split(" ")[0];
      }
    };

    const time24Hour = convertTo24Hour(time);

    const dateStr = `${months[parseInt(date.split(" ")[1]) - 1]} ${
      date.split(" ")[0]
    }, ${date.split(" ")[2]} ${time24Hour}:00`;
    const scheduledTime = new Date(dateStr).getTime();
    const currentTime = new Date().getTime();

    if (scheduledTime - currentTime > tago) {
      setTimeout(async () => {
        // await new RoomEmail(url, username, user_email, time, date).send();
        // await new RoomEmail(
        //   url,
        //   recuiter_name,
        //   recuiter_email,
        //   time,
        //   date
        // ).send();
      }, scheduledTime - currentTime);
    }

    const string = await _randomStringGenerator(8);
    const roomcreation = await sessionModel.create({
      user: userid,
      recuiter: recuiterid,
      user_name: username,
      recuiter_name: recuiter_name,
      round: round,
      transcationid: transid,
      time: time,
      date: date,
      roomid: string,
    });

    const url = `https://skillkart.app/room/${string}`;

    // await new RoomEmail(url, username, user_email, time, date).send();
    // await new RoomEmail(url, recuiter_name, recuiter_email, time, date).send();

    res.status(200).json({
      status: "success",
      data: roomcreation,
    });
  }
};

exports._updateUserExpression = async (req, res) => {
  const {
    userid,
    rid,
    angry,
    disguted,
    fearful,
    happy,
    netural,
    sad,
    roomid,
    surprised,
  } = req.body;
  const finduser = await Roomai.findOne({
    roomid: roomid,
  });

  if (finduser) {
    let newarr = {
      Ranacorus: angry,
      disguted: disguted,
      Nervousness: fearful,
      Enthusiasm: happy,
      Confidence: netural,
      Depress: sad,
    };

    finduser.expression.push(newarr);
    await finduser.save();
    res.status(200).json({
      status: "success",
    });
  } else {
    await Roomai.create({
      userid: userid,
      recuiterid: rid,
      roomid: roomid,
      Ranacorus: angry,
      disgusted: disguted,
      Nervousness: fearful,
      Enthusiasm: happy,
      Confidence: netural,
      Depress: sad,
    });
    res.status(200).json({
      status: "success",
    });
  }
};

exports.updateUserDetail = async (req, res) => {
  const { roomid } = req.body;
  const request = await sessionModel.findOne({
    roomid: roomid,
  });

  if (request) {
    request.compeleted = true;
    res.status(200).json({
      status: "success",
    });
    await request.save();
  } else {
    res.status(400).json({
      status: "Failed",
    });
  }
};
