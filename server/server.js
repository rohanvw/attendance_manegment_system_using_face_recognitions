const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const path = require("path");
const fs = require("fs");

const mongoURI = 'mongodb+srv://rohanwahule12345:attendance@attendance.jkl3ryi.mongodb.net/?appName=attendance';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(mongoURI)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

const studentSchema = new mongoose.Schema({
  name: String,
  prn:String,
  age: String,
  course: String,
  phone: String,
  enrolledAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);
app.post('/api/students', async (req, res) => {
  const { name, prn, age, course, phone } = req.body;

  if (!name ||!prn || !age || !course || !phone) {
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
    let student = await Student.findOne({ prn });

    if (!student && (!name || !course)) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const attendanceTime = recognizedAt
      ? new Date(recognizedAt)
      : new Date();

    const period = getPeriodForCurrentTime(attendanceTime);

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
      name: student ? student.name : name,
      course: student ? student.course : course,
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
        name: student ? student.name : name,
        course: student ? student.course : course,
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
  const { prn, recognizedAt } = req.body;
  console.log("Incoming data:", req.body);
  if (!prn) {
    return res.status(400).json({ message: "PRN is required" });
  }
  try {
    const student = await Student.findOne({ prn });
    if (!student) {
      console.log("Student not found");
      return res.status(404).json({ message: "Student not found" });
    }
    const now = recognizedAt ? new Date(recognizedAt) : new Date();
    const period = getPeriodForCurrentTime(now);
    console.log("Calculated period:", period);
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
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  const periods = [
    { name: "DE",       start: 10 * 60 + 0,  end: 11 * 60 + 0 },
    { name: "ACV",     start: 11 * 60 + 0,  end: 12 * 60 + 0 },
    // Lunch break (not counted as period)
    { name: "Lunch Break", start: 12 * 60 + 0, end: 12 * 60 + 45, break: true },
    { name: "FSD", start: 12 * 60 + 45, end: 13 * 60 + 45 },
    { name: "NLP",      start: 13 * 60 + 45, end: 14 * 60 + 45 },
    // Tea break
    { name: "Tea Break",   start: 14 * 60 + 45, end: 15 * 60 + 0, break: true },

    { name: "BT",      start: 15 * 60 + 0,  end: 16 * 60 + 0 }
  ];
  for (const p of periods) {
    if (totalMinutes >= p.start && totalMinutes < p.end) {
      if (p.break) {
        return "Break"; // prevent marking attendance in break
      }
      return p.name;
    }
  }
  return "No Period"; // outside any class
}
app.get('/api/periodwise-attendance', async(req,res)=>{
try{
  const logs=await PeriodwiseAttendanceLog.find().sort({recognizedAt:-1});
res.json(logs);
}catch{
  console.log("Error fetching periodwise logs:", err);
  res.status(500).json({ message: "Failed to fetch periodwise attendance logs" });
}
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

