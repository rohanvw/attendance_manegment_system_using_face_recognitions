import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Front = () => {
  const [recognizedName, setRecognizedName] = useState("PRN will appear here");
  const [recognizedStudentName, setRecognizedStudentName] = useState("Name will appear here");
  const [attendanceMessage, setAttendanceMessage] = useState(""); 
  const [students, setStudents] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/students");
        setStudents(response.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    getCamera();
  }, []);

  const handleRecognize = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");
  
    try {
      const response = await axios.post("http://localhost:5000/recognize", { image: imageData });
      const prn = response.data.prn;
  
      setRecognizedName(prn);

      const matchedStudent = students.find(
  (student) => String(student.prn).trim() === String(prn).trim()
);

if (matchedStudent) {
  setRecognizedStudentName(matchedStudent.name);
} else {
  setRecognizedStudentName("Not found");
}

  
      // const matchedStudent = students.find((student) => student.prn == prn.trim());
      // if (matchedStudent) {
      //   setRecognizedStudentName(matchedStudent.name);
      // } else {
      //   setRecognizedStudentName("Not found");
      // }
  
      const recognizedAt = new Date().toISOString(); // Always send recognizedAt
      const currentPeriod = getCurrentPeriod();
  
      if (currentPeriod === 'No Period') {
        setAttendanceMessage("Attendance cannot be recorded outside of class periods.");
        return;
      }

      if (currentPeriod === 'Break') {
        setAttendanceMessage("Attendance cannot be recorded during break.");
        return;
      }


      // Submit period-wise attendance
      try {
         await axios.post("http://localhost:5001/api/attendance", {
        prn,
        name: matchedStudent ? matchedStudent.name : null,
        course: matchedStudent ? matchedStudent.course : null,
        recognizedAt
    });
        // const res = await axios.post("http://localhost:5001/api/periodwise-attendance", {
        //   prn,
        //   name: matchedStudent ? matchedStudent.name : null,
        //   course: matchedStudent ? matchedStudent.course : null,
        //   recognizedAt
        // });


        alert(res.data.message);
        setAttendanceMessage(`${currentPeriod} attendance successfully recorded.`);
      } catch (err) {
        alert(err.response?.data?.message || "Something went wrong");
        setAttendanceMessage("Failed to record attendance.");
      }
  
    } catch (err) {
      console.error(err);
      setRecognizedName("Error recognizing");
      setRecognizedStudentName("Recognition failed");
      setAttendanceMessage("Error in recognition or attendance.");
    }
  };
 
  function getCurrentPeriod() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const periods = [
    { name: "DE",       start: 10 * 60 + 0,  end: 11 * 60 + 0 },
    { name: "ACV",     start: 11 * 60 + 0,  end: 12 * 60 + 0 },

    // Lunch break
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
        return "Break"; // block attendance
      }
      return p.name;
    }
  }

  return "No Period"; // outside class time
}



  

  return (
    <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]">
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col sm:flex-row gap-5 w-full h-[80vh] p-5">
          <div className="w-1/2 h-full flex items-center justify-center">
            <div className="w-full max-w-2xl aspect-video bg-black rounded-2xl shadow-2xl overflow-hidden border-2 border-[#E8E4FF]">
              <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
              <canvas ref={canvasRef} width="640" height="480" className="hidden"></canvas>
            </div>
          </div>

          <div className="w-1/2 h-full flex flex-col items-center justify-center text-center">
            <h1 className="text-5xl font-bold text-white drop-shadow-md mb-6">
              Smart Attendance System
            </h1>

            <div className="mt-5 text-2xl font-medium text-gray-300">
              Recognized PRN: <span className="text-emerald-400 font-bold">{recognizedName}</span>
            </div>
            <div className="mt-5 text-2xl font-medium text-gray-300">
              Recognized Student Name: <span className="text-emerald-400 font-bold">{recognizedStudentName}</span>
            </div>

            {/* Display the attendance message */}
            {attendanceMessage && (
              <div className="mt-5 text-lg font-medium text-yellow-300">
                {attendanceMessage}
              </div>
            )}
<div className="flex flex-row gap-3">
<button
              onClick={handleRecognize}
              className="mt-8 transition-background inline-flex h-12 items-center justify-center rounded-xl border border-gray-800 bg-gradient-to-r from-gray-100 via-[#c7d2fe] to-[#8678f9] bg-[length:200%_200%] bg-[0%_0%] px-6 font-medium text-gray-950 duration-500 hover:bg-[100%_200%] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              Recognize Face
            </button>

            <Link to="/Signin">
              <button className="mt-8 transition-background inline-flex h-12 items-center justify-center rounded-xl border border-gray-800 bg-gradient-to-r from-gray-100 via-[#c7d2fe] to-[#8678f9] bg-[length:200%_200%] bg-[0%_0%] px-6 font-medium text-gray-950 duration-500 hover:bg-[100%_200%] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50">
                Dashboard
              </button>
            </Link>
</div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Front;
