# Attendance Management System Using Face Recognition

## 📌 Project Overview

The Attendance Management System Using Face Recognition is a web-based application that automates student attendance using facial recognition technology. The system allows students to enroll their faces, mark attendance through a webcam, and provides analytics and attendance reports for administrators.

## 🚀 Features

* Face Enrollment using Webcam
* Face Recognition-based Attendance Marking
* Student Management
* Attendance Logs
* Period-wise Attendance Tracking
* Monthly Attendance Reports
* Defaulter Student Identification
* Attendance Analytics Dashboard
* CSV Report Download
* MongoDB Database Integration

## 🛠️ Technologies Used

### Frontend

* React.js
* Vite
* React Router
* Tailwind CSS
* Recharts

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose

### Face Recognition Module

* Python
* OpenCV
* Haar Cascade Classifier

## 📂 Project Structure

attendance_manegment_system_using_face_recognition/

├── facefrontend/

│ ├── src/

│ ├── public/

│ ├── package.json

│ └── vite.config.js

├── server/

│ ├── server.js

│ ├── package.json

│ └── .env

├── python-face-api/

│ ├── enroll.py

│ ├── recognize_api.py

│ └── faces/

└── README.md

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/rohanvw/attendance_manegment_system_using_face_recognitions.git
cd attendance-management-system
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../facefrontend
npm install
```

### 4. Install Python Dependencies

```bash
cd ../python-face-api
pip install opencv-python flask numpy
```

### 5. Configure Environment Variables

Create `.env` file inside `server` folder:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
```

### 6. Start Backend Server

```bash
cd server
node server.js
```

### 7. Start Frontend

```bash
cd facefrontend
npm run dev
```

### 8. Run Face Recognition API

```bash
cd python-face-api
python recognize_api.py
```

## 📊 Modules

### Admin Module

* Add Students
* View Enrolled Students
* View Attendance Logs
* View Analytics
* Generate Monthly Reports

### Student Module

* Face Enrollment
* Attendance Marking

### Analytics Module

* Subject-wise Attendance
* Present vs Absent Analysis
* Monthly Attendance Report
* Defaulter List


## 👨‍💻 Developed By

Rohan Wahule

B.Tech CSE (AI & ML)

Hi-Tech Institute of Technology, Chhatrapati Sambhajinagar

Dr. Babasaheb Ambedkar Technological University (DBATU)

## 📜 License

This project is developed for educational and academic purposes.
