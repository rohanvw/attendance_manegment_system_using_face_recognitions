import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaFileAlt, FaUser, FaDownload, FaClock } from 'react-icons/fa';
import { FaJava, FaPython, FaNetworkWired, FaBrain, FaReact } from "react-icons/fa";

const Period = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

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
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // const periods = [
  //   { name: 'DE', time: '10:00 AM' },
  //   { name: 'ACV', time: '11:00 AM' },
  //   { name: 'FSD', time: '12:45 PM' },
  //   { name: 'NLP', time: '1:45 PM' },
  //   { name: 'BT', time: '3:00 PM' }
  // ];

  const filteredData = filter
    ? attendanceData.filter((log) => log.period === filter)
    : attendanceData;

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
                  <option value="">All</option>
                  {[...new Set(attendanceData.map(log => log.period))].map(period => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
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
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-500">Loading attendance data...</td>
                    </tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-100 rounded-xl">
                        <td className="px-4 py-2 rounded-l-xl">{log.name}</td>
                        <td className="px-4 py-2">{log.prn}</td>
                        <td className="px-4 py-2">{log.period}</td>
                        <td className="px-4 py-2">{new Date(log.recognizedAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-500">No attendance records found.</td>
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
