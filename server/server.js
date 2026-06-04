require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const path = require("path");
const fs = require("fs");

const mongoURI = process.env.MONGODB_URI;

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const studentSchema = new mongoose.Schema({
  name: String,
  prn: String,
  age: String,
  course: String,
  phone: String,
  enrolledAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
app.post('/api/students', async (req, res) => {
  const { name, prn, age, course, phone } = req.body;

  if (!name || !prn || !age || !course || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newStudent = new Student({ name, prn, age, course, phone });
    await newStudent.save();
    res.status(200).json({ message: "Student saved to database!" });
  } catch (err) {
    console.error("Error saving student:", err);
    res.status(500).json({ message: "Failed to save student" });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ enrolledAt: -1 });
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});
///////////////new log for attence storage////////
app.get('/api/attendance', async (req, res) => {
  try {
    const logs = await AttendanceLog.find().sort({ recognizedAt: -1 });
    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ message: "Failed to fetch attendance logs" });
  }
});

const attendanceLogSchema = new mongoose.Schema({
  prn: String,
  name: String,
  course: String,
  period: String,
  recognizedAt: { type: Date, default: Date.now }
});
// const attendanceLogSchema = new mongoose.Schema({
//   prn: String,
//   name: String,
//   course: String,
//   recognizedAt: { type: Date, default: Date.now }
// });

const AttendanceLog = mongoose.model('AttendanceLog', attendanceLogSchema);
app.post('/api/attendance', async (req, res) => {
  const { prn, name, course, recognizedAt } = req.body;

  if (!prn) {
    return res.status(400).json({ message: "PRN is required" });
  }

  try {
    const student = await Student.findOne({ prn });
    console.log("Entered Name:", name);
console.log("Entered PRN:", prn);
console.log("Student Found:", student);

    if (!student) {
      return res.status(400).json({
        message: "Student is not enrolled. Please add the student first."
      });
    }
    if (
      name &&
      student.name.toLowerCase().trim() !==
      name.toLowerCase().trim()
    ) {
      return res.status(400).json({
        message: "Name and PRN do not match."
      });
    }
    const attendanceTime = recognizedAt
      ? new Date(recognizedAt)
      : new Date();

    const period = getPeriodForCurrentTime(attendanceTime);
    if (period === "Holiday") {
      return res.status(400).json({
        message: "Attendance cannot be recorded on Sunday"
      });
    }
    if (period === "Break") {
      return res.status(400).json({
        message: "Attendance cannot be marked during break"
      });
    }

    if (period === "No Period") {
      return res.status(400).json({
        message: "No valid lecture at this time"
      });
    }

    const today = new Date(
      attendanceTime.toISOString().split("T")[0]
    );

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existingAttendance = await AttendanceLog.findOne({
      prn,
      period,
      recognizedAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: `${period} attendance already recorded today`
      });
    }

    const attendanceLog = new AttendanceLog({
      prn,
      name: student.name,
      course: student.course,
      period,
      recognizedAt: attendanceTime
    });
    await attendanceLog.save();

    const existingPeriodLog =
      await PeriodwiseAttendanceLog.findOne({
        prn,
        period,
        recognizedAt: {
          $gte: today,
          $lt: tomorrow
        }
      });

    if (!existingPeriodLog) {
      await PeriodwiseAttendanceLog.create({
        prn,
        name: student.name,
        course: student.course,
        period,
        recognizedAt: attendanceTime
      });
    }

    res.status(200).json({
      message: `Attendance recorded for ${period}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to log attendance"
    });
  }
});
/*
app.post('/api/attendance', async (req, res) => {
  const { prn, name, course, recognizedAt } = req.body;
  if (!prn) {
    return res.status(400).json({ message: "PRN is required" });
  }
  try {
    let student = await Student.findOne({ prn });
    // If no student found, but name & course provided => allow manual entry
    if (!student && (!name || !course)) {
      return res.status(404).json({ message: "Student not found, and insufficient manual data provided" });
    }

    // Determine the current date (or use recognizedAt if provided)
    const today = new Date().toISOString().split('T')[0];
    const recognizedDate = recognizedAt ? new Date(recognizedAt) : new Date();

    // Check for existing attendance on the same day
    const existingLog = await AttendanceLog.findOne({
      prn,
      recognizedAt: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1))
      }
    });
    if (existingLog) {
      return res.status(400).json({ message: "Attendance already recorded for today" });
    }
    // Use data from the DB or from manual fields
    const log = new AttendanceLog({
      prn,
      name: student ? student.name : name,
      course: student ? student.course : course,
      recognizedAt: recognizedDate
    });
    await log.save();
    res.status(200).json({ message: "Attendance logged successfully" });
  } catch (err) {
    console.error("Error logging attendance:", err);
    res.status(500).json({ message: "Failed to log attendance" });
  }
});
*/

///////////////////////admin login and signup///////////
const AdminSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const Admin = mongoose.model("Admin", AdminSchema);
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const newAdmin = new Admin({
      username,
      email,
      password, // no hashing
    });
    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
/////////////////signin.///////
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (admin.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }
    res.status(200).json({ message: "Signin successful", admin: { username: admin.username, email: admin.email } });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
const periodwiseAttendanceLogSchema = new mongoose.Schema({
  prn: String,
  name: String,
  course: String,
  period: String,
  recognizedAt: { type: Date, default: Date.now }
});
const PeriodwiseAttendanceLog = mongoose.model('PeriodwiseAttendanceLog', periodwiseAttendanceLogSchema);
app.post('/api/periodwise-attendance', async (req, res) => {
  const { prn, name, recognizedAt } = req.body;
  console.log("Incoming data:", req.body);
  if (!prn) {
    return res.status(400).json({ message: "PRN is required" });
  }
  try {
    const student = await Student.findOne({ prn });

    if (!student) {
      return res.status(400).json({
        message: "Student is not enrolled. Please add the student first."
      });
    }

    if (
      name &&
      student.name.toLowerCase().trim() !==
      name.toLowerCase().trim()
    ) {
      return res.status(400).json({
        message: "Name and PRN do not match."
      });
    }
    
    const now = recognizedAt ? new Date(recognizedAt) : new Date();
    const period = getPeriodForCurrentTime(now);
    console.log("Calculated period:", period);
    if (period === "Holiday") {
      return res.status(400).json({
        message: "Attendance cannot be recorded on Sunday"
      });
    }

    if (period === "Break") {
      return res.status(400).json({
        message: "Attendance cannot be marked during break"
      });
    }
    if (period === 'No Period') {
      return res.status(400).json({ message: "No valid class period at this time" });
    }
    const today = new Date(now.toISOString().split('T')[0]);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const existingLog = await PeriodwiseAttendanceLog.findOne({
      prn,
      period,
      recognizedAt: { $gte: today, $lt: tomorrow }
    });
    if (existingLog) {
      return res.status(400).json({ message: `Attendance already recorded for ${period} today` });
    }
    const log = new PeriodwiseAttendanceLog({
      prn,
      name: student.name,
      course: student.course,
      period,
      recognizedAt: now
    });
    await log.save();
    console.log("Successfully saved period-wise attendance:", log); // 🔍
    res.status(200).json({ message: `Period-wise attendance recorded for ${period}`, log });
  } catch (err) {
    console.error("Error logging periodwise attendance:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//  download
app.get("/download-logs", async (req, res) => {
  try {

    const logs = await AttendanceLog.find();

    console.log("Logs:", logs);

    if (logs.length === 0) {
      return res.status(404).send("No attendance logs found");
    }

    let csv = "Name,PRN,Course,Subject,Recognized At\n";

    logs.forEach((log) => {

      const formattedDate = new Date(log.recognizedAt).toLocaleString(
        'en-US',
        {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }
      );

      csv += `${log.name},${log.prn || log.usn},${log.course},${log.period || ""},"${formattedDate}"\n`;
    });

    // logs.forEach((log) => {
    //   csv += `${log.name},${log.prn || log.usn},${log.course},${log.recognizedAt}\n`;
    // });

    res.header("Content-Type", "text/csv");
    res.attachment("attendance_logs.csv");

    return res.send(csv);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating CSV");
  }
});


// Time-based period determination
function getPeriodForCurrentTime(currentTime) {

  const day = currentTime.toLocaleDateString(
    "en-US",
    { weekday: "long" }
  );

  const totalMinutes =
    currentTime.getHours() * 60 +
    currentTime.getMinutes();

  console.log("Day:", day);
  console.log("Current Time:", currentTime);
  console.log("Minutes:", totalMinutes);

  const timetable = {
    Monday: [
      { name: "AML", start: 600, end: 660 },
      { name: "ESD", start: 660, end: 720 },
      { name: "Lunch Break", start: 720, end: 765, break: true },
      { name: "I&A", start: 765, end: 825 },
      { name: "DL", start: 825, end: 885 },
      { name: "Tea Break", start: 885, end: 900, break: true },
      { name: "LAB", start: 900, end: 1020 }
    ],

    Tuesday: [
      { name: "DL", start: 600, end: 660 },
      { name: "BDA", start: 660, end: 720 },
      { name: "Lunch Break", start: 720, end: 765, break: true },
      { name: "I&A", start: 765, end: 825 },
      { name: "LIB", start: 825, end: 885 },
      { name: "Tea Break", start: 885, end: 900, break: true },
      { name: "LAB", start: 900, end: 1020 }
    ],

    Wednesday: [
      { name: "AML", start: 600, end: 660 },
      { name: "BDA", start: 660, end: 720 },
      { name: "Lunch Break", start: 720, end: 765, break: true },
      { name: "LIB", start: 765, end: 825 },
      { name: "DL", start: 825, end: 885 },
      { name: "Tea Break", start: 885, end: 900, break: true },
      { name: "LAB", start: 900, end: 1020 }
    ],

    Thursday: [
      { name: "AML", start: 600, end: 660 },
      { name: "BDA", start: 660, end: 720 },
      { name: "Lunch Break", start: 720, end: 765, break: true },
      { name: "ESD", start: 765, end: 825 },
      { name: "I&A", start: 825, end: 885 },
      { name: "Tea Break", start: 885, end: 900, break: true },
      { name: "LAB", start: 900, end: 1020 }
    ],

    Friday: [
      { name: "ESD", start: 600, end: 660 },
      { name: "BDA", start: 660, end: 720 },
      { name: "Lunch Break", start: 720, end: 765, break: true },
      { name: "I&A", start: 765, end: 825 },
      { name: "DL", start: 825, end: 885 },
      { name: "Tea Break", start: 885, end: 900, break: true },
      { name: "LAB", start: 900, end: 1020 }
    ],

    Saturday: [
      { name: "ESD", start: 600, end: 660 },
      { name: "GATE", start: 660, end: 720 },
      { name: "Lunch Break", start: 720, end: 765, break: true },
      { name: "I&A", start: 765, end: 825 },
      { name: "AML", start: 825, end: 885 },
      { name: "Tea Break", start: 885, end: 900, break: true },
      { name: "LAB", start: 900, end: 1020 }
    ]
  };

  if (day === "Sunday") {
    console.log("Returning Holiday");
    return "Holiday";
  }
  const todaySchedule = timetable[day];

  if (!todaySchedule) {
    return "No Period";
  }

  for (const period of todaySchedule) {
    if (
      totalMinutes >= period.start &&
      totalMinutes < period.end
    ) {
      if (period.break) {
        return "Break";
      }

      return period.name;
    }
  }

  return "No Period";
}
app.get('/api/periodwise-attendance', async (req, res) => {
  try {
    const logs = await PeriodwiseAttendanceLog.find().sort({ recognizedAt: -1 });
    res.json(logs);
  } catch {
    console.log("Error fetching periodwise logs:", err);
    res.status(500).json({ message: "Failed to fetch periodwise attendance logs" });
  }
});
app.get('/api/attendance-sheet', async (req, res) => {
  try {
    const selectedSubject = req.query.subject;
    console.log("Selected Subject:", selectedSubject);
    const students = await Student.find();

    const now = new Date();

    const day = now.toLocaleDateString(
      "en-US",
      { weekday: "long" }
    );

    const timetable = {
      Monday: [
        { name: "AML", start: 600, end: 660 },
        { name: "ESD", start: 660, end: 720 },
        { name: "I&A", start: 765, end: 825 },
        { name: "DL", start: 825, end: 885 },
        { name: "LAB", start: 900, end: 1020 }
      ],

      Tuesday: [
        { name: "DL", start: 600, end: 660 },
        { name: "BDA", start: 660, end: 720 },
        { name: "I&A", start: 765, end: 825 },
        { name: "LIB", start: 825, end: 885 },
        { name: "LAB", start: 900, end: 1020 }
      ],

      Wednesday: [
        { name: "AML", start: 600, end: 660 },
        { name: "BDA", start: 660, end: 720 },
        { name: "LIB", start: 765, end: 825 },
        { name: "DL", start: 825, end: 885 },
        { name: "LAB", start: 900, end: 1020 }
      ],

      Thursday: [
        { name: "AML", start: 600, end: 660 },
        { name: "BDA", start: 660, end: 720 },
        { name: "ESD", start: 765, end: 825 },
        { name: "I&A", start: 825, end: 885 },
        { name: "LAB", start: 900, end: 1020 }
      ],

      Friday: [
        { name: "ESD", start: 600, end: 660 },
        { name: "BDA", start: 660, end: 720 },
        { name: "I&A", start: 765, end: 825 },
        { name: "DL", start: 825, end: 885 },
        { name: "LAB", start: 900, end: 1020 }
      ],

      Saturday: [
        { name: "ESD", start: 600, end: 660 },
        { name: "GATE", start: 660, end: 720 },
        { name: "I&A", start: 765, end: 825 },
        { name: "AML", start: 825, end: 885 },
        { name: "LAB", start: 900, end: 1020 }
      ]
    };

    const totalMinutes =
      now.getHours() * 60 +
      now.getMinutes();

    const todaySchedule = timetable[day] || [];

    let currentSubject = null;
    let lectureEnded = false;

    for (const p of todaySchedule) {

      if (
        totalMinutes >= p.start &&
        totalMinutes < p.end
      ) {
        currentSubject = p.name;
      }

      if (
        totalMinutes >= p.end
      ) {
        currentSubject = p.name;
        lectureEnded = true;
      }
    }
    console.log("Current Day:", day);
    console.log("Minutes:", totalMinutes);
    console.log("Subject:", currentSubject);
    console.log("Lecture Ended:", lectureEnded);

    if (!currentSubject) {

      if (todaySchedule.length > 0) {

        const lastPeriod =
          todaySchedule[todaySchedule.length - 1];

        currentSubject = lastPeriod.name;
        lectureEnded = true;

      } else {

        return res.json([]);

      }
    }


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const subjectToShow =
      selectedSubject || currentSubject;

    const attendanceLogs =
      await PeriodwiseAttendanceLog.find({
        period: subjectToShow,
        recognizedAt: {
          $gte: today,
          $lt: tomorrow
        }
      });

    const result = students.map(student => {

      const presentRecord =
        attendanceLogs.find(
          log => log.prn === student.prn
        );

      let status = "Pending";

      if (presentRecord) {
        status = "Present";
      }
      else if (lectureEnded) {
        status = "Absent";
      }

      return {
        name: student.name,
        prn: student.prn,
        subject: subjectToShow,
        time: presentRecord
          ? presentRecord.recognizedAt
          : null,
        status
      };
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to load attendance sheet"
    });
  }
});
app.get('/download-subject-report', async (req, res) => {
  try {

    const { subject, fromDate, toDate } = req.query;

    if (!subject || !fromDate || !toDate) {
      return res.status(400).json({
        message: 'Subject, fromDate and toDate are required'
      });
    }

    const students = await Student.find();

    const startDate = new Date(fromDate);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(toDate);
    endDate.setHours(23, 59, 59, 999);

    const attendanceLogs =
      await PeriodwiseAttendanceLog.find({
        period: subject,
        recognizedAt: {
          $gte: startDate,
          $lte: endDate
        }
      });

    const uniqueDates = [
      ...new Set(
        attendanceLogs.map(log =>
          new Date(log.recognizedAt)
            .toISOString()
            .split('T')[0]
        )
      )
    ];

    const totalLectures = uniqueDates.length;

    let csv =
      `Subject: ${subject}\n` +
      `From Date: ${fromDate}\n` +
      `To Date: ${toDate}\n\n` +
      "Name,PRN,Subject,Total Lectures,Present,Absent,Attendance Percentage\n";

    students.forEach(student => {

      const presentCount =
        attendanceLogs.filter(
          log => log.prn === student.prn
        ).length;

      const absentCount =
        totalLectures - presentCount;

      const percentage =
        totalLectures > 0
          ? (
            (presentCount / totalLectures) * 100
          ).toFixed(2)
          : 0;

      csv +=
        `${student.name},${student.prn},${subject},${totalLectures},${presentCount},${absentCount},${percentage}%\n`;
    });

    res.header(
      "Content-Type",
      "text/csv"
    );

    res.attachment(
      `${subject}_attendance_report.csv`
    );

    res.send(csv);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to generate report"
    });
  }
});
app.get('/api/subject-analytics', async (req, res) => {

  try {

    const subjects = [
      "AML",
      "BDA",
      "DL",
      "I&A",
      "LIB",
      "LAB",
      "ESD",
      "GATE"
    ];

    const result = [];

    for (const subject of subjects) {

      const logs =
        await PeriodwiseAttendanceLog.find({
          period: subject
        });

      const totalStudents =
        await Student.countDocuments();

      const present =
        new Set(logs.map(log => log.prn));

      const percentage =
        totalStudents > 0
          ? (present.size / totalStudents) * 100
          : 0;

      result.push({
        subject,
        attendance:
          Number(percentage.toFixed(2))
      });
    }

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Analytics error"
    });
  }
});

app.get('/api/present-absent/:subject', async (req, res) => {

  try {

    const subject =
      req.params.subject;

    const totalStudents =
      await Student.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      today.getDate() + 1
    );

    const present =
      await PeriodwiseAttendanceLog.distinct(
        "prn",
        {
          period: subject,
          recognizedAt: {
            $gte: today,
            $lt: tomorrow
          }
        }
      );

    res.json({
      present: present.length,
      absent:
        totalStudents - present.length
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Analytics error"
    });
  }
});

app.get('/api/defaulters', async (req, res) => {

  try {

    const students =
      await Student.find();

    const result = [];

    students.forEach(student => {

      result.push({
        name: student.name,
        prn: student.prn,
        percentage: 60
      });

    });

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Analytics error"
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

