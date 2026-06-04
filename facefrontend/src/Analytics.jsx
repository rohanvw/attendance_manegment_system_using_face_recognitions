import React, {
    useEffect,
    useState
} from "react";

import { Link } from "react-router-dom";

import {
    FaHome,
    FaFileAlt,
    FaUser,
    FaDownload,
    FaClock,
    FaClipboardList
} from "react-icons/fa";

import "./App.css";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from "recharts";

export default function Analytics() {

    const [subjects, setSubjects] =
        useState([]);

    const [pieData, setPieData] =
        useState([]);

    const [subject, setSubject] =
        useState("AML");

    const [defaulters, setDefaulters] =
        useState([]);

    useEffect(() => {

        fetch(
            "http://localhost:5001/api/subject-analytics"
        )
            .then(res => res.json())
            .then(setSubjects);

        fetch(
            "http://localhost:5001/api/defaulters"
        )
            .then(res => res.json())
            .then(setDefaulters);

    }, []);

    useEffect(() => {

        fetch(
            `http://localhost:5001/api/present-absent/${encodeURIComponent(subject)}`
        )
            .then(res => res.json())
            .then(data => {

                setPieData([
                    {
                        name: "Present",
                        value: data.present
                    },
                    {
                        name: "Absent",
                        value: data.absent
                    }
                ]);

            });

    }, [subject]);

    const totalStudents =
        pieData.reduce(
            (sum, item) => sum + item.value,
            0
        );

    return (
        <div className="min-h-screen p-4 bg-split">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Sidebar */}
                <div className="w-full lg:w-64 bg-white shadow-xl rounded-2xl p-4 flex flex-col justify-between min-h-[90vh]">

                    <div>

                        <h2 className="text-xl font-semibold text-center mb-6">
                            Admin Page
                        </h2>

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
                                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100">
                                    <FaFileAlt className="text-red-500" />
                                    <span>Enrolled</span>
                                </button>
                            </Link>

                            <Link to="/Period">
                                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl hover:bg-gray-100">
                                    <FaClock className="text-green-500" />
                                    <span>Period Wise</span>
                                </button>
                            </Link>

                            <Link to="/analytics">
                                <button className="flex items-center space-x-2 w-full text-left py-2 px-4 rounded-xl bg-gray-100">
                                    <FaClipboardList className="text-blue-500" />
                                    <span>Analytics</span>
                                </button>
                            </Link>

                        </div>

                    </div>

                    <Link to="/signin">
                        <button className="w-full py-2 rounded-xl bg-[#1E2A78] text-white shadow-md flex items-center justify-center space-x-2 hover:bg-[#16239D]">
                            <FaDownload />
                            <span>LogOut</span>
                        </button>
                    </Link>

                </div>

                {/* Main Content */}

                <div className="flex-1">

                    <div className="text-white mb-6">
                        <p>Pages / Analytics</p>
                        <h1 className="text-lg font-semibold">
                            Attendance Analytics
                        </h1>
                    </div>

                    <div className="bg-white rounded-[1.1rem] shadow-md p-6">

                        <h2 className="font-bold text-xl mb-4">
                            Subject Wise Attendance
                        </h2>

                        <ResponsiveContainer
                            width="100%"
                            height={350}
                        >
                            <BarChart data={subjects}>
                                <XAxis dataKey="subject" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="attendance" />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="mt-10">

                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="border px-3 py-2 rounded"
                            >

                                <option>AML</option>
                                <option>BDA</option>
                                <option>DL</option>
                                <option>I&A</option>
                                <option>LIB</option>
                                <option>LAB</option>
                                <option>ESD</option>
                                <option>GATE</option>

                            </select>

                            <h2 className="font-bold text-xl mb-4 mt-8">
                                Present vs Absent Students
                            </h2>

                            <div className="grid grid-cols-2 gap-4 mb-6">

                                <div className="bg-green-100 p-4 rounded-lg text-center">
                                    <h3 className="font-bold text-green-700">
                                        Present Students
                                    </h3>

                                    <p className="text-3xl font-bold">
                                        {pieData.find(x => x.name === "Present")?.value || 0}
                                    </p>
                                </div>

                                <div className="bg-red-100 p-4 rounded-lg text-center">
                                    <h3 className="font-bold text-red-700">
                                        Absent Students
                                    </h3>

                                    <p className="text-3xl font-bold">
                                        {pieData.find(x => x.name === "Absent")?.value || 0}
                                    </p>
                                </div>

                            </div>

                            <ResponsiveContainer
                                width="100%"
                                height={350}
                            >

                                <BarChart data={pieData}>

                                    <CartesianGrid strokeDasharray="3 3" />

                                    <XAxis dataKey="name" />

                                    <YAxis
                                        allowDecimals={false}
                                        domain={[0, totalStudents]}
                                    />

                                    <Tooltip />

                                    <Bar dataKey="value" />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                        <div className="mt-10">

                            <h2 className="font-bold text-xl mb-4">
                                Defaulter Students
                            </h2>

                            <table className="w-full border">

                                <thead>

                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left">
                                            Name
                                        </th>

                                        <th className="p-3 text-left">
                                            PRN
                                        </th>

                                        <th className="p-3 text-left">
                                            Attendance %
                                        </th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {defaulters.map((student, index) => (
                                        <tr key={index}>

                                            <td className="p-3">
                                                {student.name}
                                            </td>

                                            <td className="p-3">
                                                {student.prn}
                                            </td>

                                            <td className="p-3">
                                                {student.percentage}%
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}