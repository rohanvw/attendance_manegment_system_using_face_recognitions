import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaFileAlt, FaUser, FaDownload, FaClock } from 'react-icons/fa';
import { FaJava, FaPython, FaNetworkWired, FaBrain, FaReact } from "react-icons/fa";

const Period = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("AML");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const timetable = {
    Monday: [
      ["10:00 - 11:00", "AML"],
      ["11:00 - 12:00", "ESD"],
      ["12:00 - 12:45", "Lunch Break"],
      ["12:45 - 1:45", "I&A"],
      ["1:45 - 2:45", "DL"],
      ["2:45 - 3:00", "Tea Break"],
      ["3:00 - 5:00", "LAB"]
    ],

    Tuesday: [
      ["10:00 - 11:00", "DL"],
      ["11:00 - 12:00", "BDA"],
      ["12:00 - 12:45", "Lunch Break"],
      ["12:45 - 1:45", "I&A"],
      ["1:45 - 2:45", "LIB"],
      ["2:45 - 3:00", "Tea Break"],
      ["3:00 - 5:00", "LAB"]
    ],

    Wednesday: [
      ["10:00 - 11:00", "AML"],
      ["11:00 - 12:00", "BDA"],
      ["12:00 - 12:45", "Lunch Break"],
      ["12:45 - 1:45", "LIB"],
      ["1:45 - 2:45", "DL"],
      ["2:45 - 3:00", "Tea Break"],
      ["3:00 - 5:00", "LAB"]
    ],

    Thursday: [
      ["10:00 - 11:00", "AML"],
      ["11:00 - 12:00", "BDA"],
      ["12:00 - 12:45", "Lunch Break"],
      ["12:45 - 1:45", "ESD"],
      ["1:45 - 2:45", "I&A"],
      ["2:45 - 3:00", "Tea Break"],
      ["3:00 - 5:00", "LAB"]
    ],

    Friday: [
      ["10:00 - 11:00", "ESD"],
      ["11:00 - 12:00", "BDA"],
      ["12:00 - 12:45", "Lunch Break"],
      ["12:45 - 1:45", "I&A"],
      ["1:45 - 2:45", "DL"],
      ["2:45 - 3:00", "Tea Break"],
      ["3:00 - 5:00", "LAB"]
    ],

    Saturday: [
      ["10:00 - 11:00", "ESD"],
      ["11:00 - 12:00", "GATE"],
      ["12:00 - 12:45", "Lunch Break"],
      ["12:45 - 1:45", "I&A"],
      ["1:45 - 2:45", "AML"],
      ["2:45 - 3:00", "Tea Break"],
      ["3:00 - 5:00", "LAB"]
    ]
  };

  const currentDay = new Date().toLocaleDateString(
    "en-US",
    { weekday: "long" }
  );

  const todayTimetable = timetable[currentDay] || [];
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/periodwise-attendance");
        const data = await response.json();
        setAttendanceData(data);
        const sheetResponse =
          await fetch(
            `http://localhost:5001/api/attendance-sheet?subject=${filter || "AML"}`
          );
        const sheetData =
          await sheetResponse.json();

        setAttendanceSheet(sheetData);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [filter]);

  // const periods = [
  //   { name: 'DE', time: '10:00 AM' },
  //   { name: 'ACV', time: '11:00 AM' },
  //   { name: 'FSD', time: '12:45 PM' },
  //   { name: 'NLP', time: '1:45 PM' },
  //   { name: 'BT', time: '3:00 PM' }
  // ];

  const filteredAttendanceSheet =
    attendanceSheet.filter(
      (student) => student.subject === filter
    );

    const downloadSubjectReport = () => {

  if (!filter) {
    alert("Please select subject");
    return;
  }

  if (!fromDate || !toDate) {
    alert("Please select date range");
    return;
  }

  window.open(
    `http://localhost:5001/download-subject-report?subject=${filter}&fromDate=${fromDate}&toDate=${toDate}`,
    "_blank"
  );
};
  return (
    <div className="min-h-screen p-4 bg-split relative">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white shadow-xl rounded-2xl p-4 flex flex-col justify-between min-h-[90vh]">
          <div>
            <h2 className="text-xl font-semibold text-center mb-6">Admin Page</h2>
            <div className="flex flex-col gap-5">
              <Link to="/dashboard">
                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100">
                  <FaHome className="text-purple-600" />
                  <span>Home</span>
                </button>
              </Link>
              <Link to="/Addstudent">
                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100">
                  <FaUser className="text-black" />
                  <span>Add Students</span>
                </button>
              </Link>
              <Link to="/Enrolled">
                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100 bg-gray-50">
                  <FaFileAlt className="text-red-500" />
                  <span>Enrolled</span>
                </button>
              </Link>
              <Link to="/Period">
                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300">
                  <FaClock className="text-green-500" />
                  <span>Period Wise</span>
                </button>
              </Link>
            </div>
          </div>
          <Link to='/signin'>
            <button className="w-full py-2 rounded-xl bg-[#1E2A78] text-white shadow-md flex items-center justify-center space-x-2 hover:bg-[#16239D]">
              <FaDownload />
              <span>LogOut</span>
            </button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-white mb-6 gap-4">
            <div>
              <p>Pages / Subject Wise</p>
              <h1 className="text-lg font-semibold">Student Attendance Subject Wise</h1>
            </div>
          </div>

          <div className="bg-white rounded-[1.1rem] shadow-md p-4">
            <h1 className="text-gray-900 ml-2 font-bold text-xl">
              TY Timetable ({currentDay})
            </h1>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3">Time</th>
                    <th className="border p-3">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {todayTimetable.map((row, index) => (
                    <tr
                      key={index}
                      className={
                        row[1].includes("Lunch")
                          ? "bg-yellow-100"
                          : row[1].includes("Break")
                            ? "bg-orange-100"
                            : ""
                      }
                    >
                      <td className="border p-3">{row[0]}</td>
                      <td className="border p-3">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* Filter Dropdown */}
            <div className="flex gap-3 mt-4">

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border rounded px-3 py-2"
              />

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border rounded px-3 py-2"
              />

              <button
                onClick={downloadSubjectReport}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Download CSV
              </button>

            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="courseFilter" className="text-sm font-medium text-gray-700">
                  Filter by Course:
                </label>
                <select
                  id="courseFilter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="AML">AML</option>
                  <option value="ESD">ESD</option>
                  <option value="BDA">BDA</option>
                  <option value="DL">DL</option>
                  <option value="I&A">I&A</option>
                  <option value="LIB">LIB</option>
                  <option value="LAB">LAB</option>
                  <option value="GATE">GATE</option>
                </select>
              </div>

              {/* Attendance Table */}
              <table className="min-w-full table-auto border-separate border-spacing-y-2 text-sm text-gray-900">
                <thead>
                  <tr className="bg-[#F7F7F7] text-gray-900">
                    <th className="text-left px-4 py-3 rounded-l-lg">Name</th>
                    <th className="text-left px-4 py-3">PRN</th>
                    <th className="text-left px-4 py-3">Subject</th>
                    <th className="text-left px-4 py-3">Time</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendanceSheet.length > 0 ? (
                    filteredAttendanceSheet.map((student, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          {student.name}
                        </td>

                        <td className="px-4 py-2">
                          {student.prn}
                        </td>

                        <td className="px-4 py-2">
                          {student.subject}
                        </td>

                        <td className="px-4 py-2">
                          {student.time
                            ? new Date(student.time)
                              .toLocaleString()
                            : "-"}
                        </td>

                        <td className="px-4 py-2">
                          {student.status === "Present" ? (
                            <span className="text-green-600 font-bold">
                              Present
                            </span>
                          ) : student.status === "Absent" ? (
                            <span className="text-red-600 font-bold">
                              Absent
                            </span>
                          ) : (
                            <span className="text-yellow-600 font-bold">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center py-4"
                      >
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Period;
