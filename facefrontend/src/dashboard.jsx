import "./App.css";
import { FaHome, FaFileAlt, FaUser, FaDownload } from 'react-icons/fa';
import { FaUserGraduate, FaClipboardList, FaUsers, FaClock } from "react-icons/fa";
import { Link } from 'react-router-dom';
import axios from 'axios';
import React, { useState, useEffect } from 'react';




const Dashboard = () => {
    const [attendance, setAttendance] = useState([]);
    const [students, setStudents] = useState([]);
    // const [currentPage, setCurrentPage] = useState(1);
    // const [itemsPerPage] = useState(4);
    const [selectedCourse, setSelectedCourse] = useState("All");

    const today = new Date().toISOString().split('T')[0];
    const presentTodayPRNs = new Set(
        attendance
            .filter((student) => {
                const attendedDate = new Date(student.recognizedAt)
                    .toISOString()
                    .split("T")[0];

                return attendedDate === today;
            })
            .map((student) => student.prn)
    );

    const presentTodayCount = presentTodayPRNs.size;
    // const presentToday = attendance.filter((student) => {
    //     const attendedDate = new Date(student.recognizedAt).toISOString().split('T')[0];
    //     return attendedDate === today;
    // });

    const handleManualAttendance = async () => {
        const name = document.querySelector('input[name="manual_name"]').value;
        const prn = document.querySelector('input[name="manual_prn"]').value;
        const course = document.querySelector('input[name="manual_course"]').value;
        const recognizedAtInput = document.querySelector('input[name="recognizedAt"]').value;

        try {
            const res = await axios.post("http://localhost:5001/api/attendance", {
                name,
                prn,
                course,
                recognizedAt: recognizedAtInput || undefined
            });
            alert(res.data.message);
        } catch (err) {
            alert(err.response?.data?.message || "Something went wrong");
        }
    };

    const totalStudents = students.length;
    const absentStudents = Math.max(
        0,
        totalStudents - presentTodayCount
    );

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/attendance');
                setAttendance(response.data);
            } catch (err) {
                console.error("Error fetching attendance:", err);
            }
        };

        const fetchStudents = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/students');
                setStudents(response.data);
            } catch (err) {
                console.error("Error fetching students:", err);
            }
        };

        fetchAttendance();
        fetchStudents();
    }, []);

    const courseList = ["All", ...new Set(attendance.map((student) => student.course))];

    const filteredAttendance = selectedCourse === "All"
        ? attendance
        : attendance.filter((student) => student.course === selectedCourse);

    const currentAttendance = filteredAttendance;
    // const indexOfLastItem = currentPage * itemsPerPage;
    // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    // const currentAttendance = filteredAttendance.slice(indexOfFirstItem, indexOfLastItem);

    // const paginate = (pageNumber) => setCurrentPage(pageNumber);
    // download 
    const downloadLogs = () => {
        window.open("http://localhost:5001/download-logs", "_blank");
    };

    return (
        <div className="min-h-screen p-4 bg-split">
            <div className="flex flex-col lg:flex-row gap-6">

                <div className="w-full lg:w-64 bg-white shadow-xl rounded-2xl p-4 flex flex-col justify-between min-h-[90vh]">
                    <div>
                        <h2 className="text-xl mt-5 font-bold text-center  mb-6">Admin Page</h2>
                        <div className="flex flex-col gap-5">
                            <Link to="/dashboard">
                                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300">
                                    <FaHome className="text-purple-600" />
                                    <span>Home</span>
                                </button>
                            </Link>
                            <Link to="/Addstudent">
                                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300">
                                    <FaUser className="text-black" />
                                    <span>Add Students</span>
                                </button>
                            </Link>
                            <Link to="/Enrolled">
                                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300">
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
                            <Link to="/analytics">
                                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300">
                                    <FaClipboardList className="text-blue-500" />
                                    <span>Analytics</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                    <Link to='/signin'>
                        <button className="w-full py-2 rounded-xl bg-[#1E2A78] text-white shadow-md flex items-center justify-center space-x-2 hover:bg-[#16239D] active:bg-[#0f1c77] transition-all duration-300">
                            <FaDownload />
                            <span>LogOut</span>
                        </button>
                    </Link>
                </div>

                <div className="flex-1">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-white mb-6 gap-4">
                        <div>
                            <p>Pages / Dashboard</p>
                            <h1 className="text-lg font-semibold">Dashboard</h1>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* Total Students */}
                        <div className="bg-white rounded-[1.1rem] p-4 shadow-sm space-y-2.5 flex items-center justify-between">
                            <div className="flex flex-col space-y-1">
                                <div className="w-9 h-9 bg-green-100 text-green-600 flex items-center justify-center rounded-md">
                                    <FaUserGraduate className="text-lg" />
                                </div>
                                <p className="text-xs font-semibold text-gray-600">TOTAL</p>
                                <p className="text-green-600 text-md font-semibold mt-1">Students in the class</p>
                            </div>
                            <h3 className="text-5xl font-bold text-gray-800 px-6">{totalStudents}</h3>
                        </div>

                        {/* Present Today */}
                        <div className="bg-white rounded-[1.1rem] p-4 shadow-sm space-y-2.5 flex items-center justify-between">
                            <div className="flex flex-col space-y-1">
                                <div className="w-9 h-9 bg-blue-100 text-blue-600 flex items-center justify-center rounded-md">
                                    <FaClipboardList className="text-lg" />
                                </div>
                                <p className="text-xs font-semibold text-gray-600">TOTAL</p>
                                <p className="text-blue-600 text-md font-semibold mt-1">Students Present Today</p>
                            </div>
                            <p className="text-5xl font-bold text-gray-800 px-6">{presentTodayCount}</p>
                        </div>

                        {/* Absent Today */}
                        <div className="bg-white rounded-[1.1rem] p-4 shadow-sm space-y-2.5 flex items-center justify-between">
                            <div className="flex flex-col space-y-1">
                                <div className="w-9 h-9 bg-red-100 text-red-600 flex items-center justify-center rounded-md">
                                    <FaUsers className="text-lg" />
                                </div>
                                <p className="text-xs font-semibold text-gray-600">TOTAL</p>
                                <p className="text-red-600 text-md font-semibold mt-1">Students Absent Today</p>
                            </div>
                            <h3 className="text-5xl font-bold text-gray-800 px-6">{absentStudents}</h3>
                        </div>
                    </div>

                    <div className="w-full flex flex-row gap-5">

                        <div className="bg-white w-1/2 rounded-[1.1rem] shadow-md p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h1 className="text-gray-800 ml-2 text-md font-bold">
                                    Logs of Student Attendance
                                </h1>

                                <button
                                    onClick={downloadLogs}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Download Logs
                                </button>
                            </div>
                            <div className="flex justify-end mb-2">
                                <label htmlFor="filter" className="text-sm text-gray-700 mr-2 font-semibold">Sort by Course:</label>
                                <select
                                    id="filter"
                                    value={selectedCourse}
                                    onChange={(e) => {
                                        setSelectedCourse(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="border px-3 py-1 rounded-md text-sm"
                                >
                                    {courseList.map((course, idx) => (
                                        <option key={idx} value={course}>{course}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="overflow-y-auto mt-2 max-h-[255px] ">
                                <table className="min-w-full table-auto border-separate border-spacing-y-2 text-sm text-gray-900">
                                    <thead>
                                        <tr className="bg-[#F7F7F7] text-gray-900">
                                            <th className="text-left px-4 py-3 rounded-l-lg">Name</th>
                                            <th className="text-left px-4 py-3">PRN</th>
                                            <th className="text-left px-4 py-3">Course</th>
                                            <th className="text-left px-4 py-3">Subject</th>
                                            <th className="text-left px-4 py-3 rounded-r-lg">Timings</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentAttendance.length > 0 ? (
                                            currentAttendance.map((student, index) => (
                                                <tr
                                                    key={index}
                                                    className="hover:bg-[#f0f4f8] transition-colors duration-200 rounded-lg"
                                                >
                                                    <td className="px-4 py-3">{student.name}</td>
                                                    <td className="px-4 py-3">{student.prn}</td>
                                                    <td className="px-4 py-3">{student.course}</td>
                                                    <td className="px-4 py-3">{student.period}</td>
                                                    <td className="px-4 py-3">
                                                        {new Date(student.recognizedAt).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-gray-400">
                                                    No attendance logs available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>


                        <div className="bg-white w-1/2 h-[14.5rem] rounded-[1.1rem] shadow-md p-5">
                            <h1 className="text-gray-800 text-md font-semibold">Add Attendance Manually</h1>
                            <div className="grid grid-cols-2 gap-2 mt-5">
                                <input type="text" name="manual_name" className="w-full placeholder:text-gray-700 rounded-xl bg-[#F7F7F7] px-4 py-2" placeholder="Enter the student's name" />
                                <input type="text" name="manual_prn" className="w-full placeholder:text-gray-700 rounded-xl bg-[#F7F7F7] px-4 py-2" placeholder="Enter the student's PRN" />
                                <input type="text" name="manual_course" className="w-full placeholder:text-gray-700 rounded-xl bg-[#F7F7F7] px-4 py-2" placeholder="Enter the student's Course" />
                                <input type="datetime-local" name="recognizedAt" className="w-full placeholder:text-gray-700 rounded-xl bg-[#F7F7F7] px-4 py-2" />
                            </div>
                            <button onClick={handleManualAttendance} className="w-[12rem] mt-4 rounded-xl p-2 bg-gradient-to-r from-blue-700 to-blue-600 font-bold text-white transition-all hover:opacity-90 hover:shadow-lg">
                                Mark Attendance
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
