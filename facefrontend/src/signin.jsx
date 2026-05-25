import React, { useState } from "react";
import { Link } from "react-router-dom";

const Signin = ({ classname }) => {
    const [authMode, setAuthMode] = useState("login");
    const handleSignup = async () => {
        const username = document.querySelector("#signup-username").value;
        const email = document.querySelector("#signup-email").value;
        const password = document.querySelector("#signup-password").value;
        const retypePassword = document.querySelector("#signup-retype").value;

        if (password !== retypePassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Signup successful!");
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Something went wrong!");
            console.error(err);
        }
    };

    const handleSignin = async () => {
        const emailOrUsername = document.querySelector("#signin-email").value;
        const password = document.querySelector("#signin-password").value;

        try {
            const response = await fetch("http://localhost:5001/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: emailOrUsername,
                    password,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Signin successful!");

                window.location.href = "/dashboard";
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert("Signin failed!");
            console.error(err);
        }
    };


    return (
        <div className="mx-auto flex h-screen max-w-lg flex-col md:max-w-none md:flex-row md:pr-10">
            <div className="max-w-[50rem] rounded-3xl bg-gradient-to-t from-blue-700 via-blue-700 to-blue-600 px-4 py-10 text-white sm:px-10 md:m-6 md:mr-8">
                <p className="mb-20 font-bold tracking-wider">College Admin Panel</p>
                <p className="mb-4 text-3xl font-bold md:text-4xl md:leading-snug">
                    Welcome to <br />
                    <span className="text-yellow-300">Hi-Tech Institute of Technology</span>
                </p>
                <p className="mb-28 font-semibold leading-relaxed text-gray-200">
Admin Pannel
                </p>
                <div className="bg-blue-600/80 rounded-2xl px-6 py-8">
                    <p className="mb-3 text-gray-200">
                    "An Admin Panel for the Attendance Management System, designed to efficiently track and manage student data."
                    </p>
                    <div className="flex items-center">

                        <p className="">
                            <strong className="block text-yellow-300 font-medium">Department Of Computer Science Engineering - AIML</strong>
                            <span className="text-xs text-gray-200"> Guide : prof. Pratiksha Lagad </span>
                        </p>
                    </div>
                </div>
            </div>
            <div className="w-full flex items-center justify-center">


                <div className="px-4 py-20 mt-0 ">
                    <h2 className="mb-2 text-3xl font-bold">{authMode === "login" ? "Admin Login" : "Admin Signup"}</h2>
                    <p className="mb-1 font-medium text-gray-500">Select Mode</p>

                    <div className="mb-6 flex flex-col gap-y-2 gap-x-4 lg:flex-row">
                        <div
                            onClick={() => setAuthMode("login")}
                            className={`relative flex w-56 items-center justify-center rounded-xl px-4 py-3 font-medium cursor-pointer ${authMode === "login" ? "bg-blue-200 text-blue-800" : "bg-gray-50 text-gray-700"
                                }`}
                        >
                            <span>Login</span>
                        </div>
                        <div
                            onClick={() => setAuthMode("signup")}
                            className={`relative flex w-56 items-center justify-center rounded-xl px-4 py-3 font-medium cursor-pointer ${authMode === "signup" ? "bg-blue-200 text-blue-800" : "bg-gray-50 text-gray-700"
                                }`}
                        >
                            <span>Signup</span>
                        </div>
                    </div>

                    {authMode === "login" ? (
                        <>
                            <p className="mb-1 font-medium text-gray-500">Email</p>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    id="signin-email"
                                    className="w-full rounded-md border-2 border-gray-300 px-4 py-2"
                                    placeholder="Enter your email or username"
                                    required
                                />
                            </div>
                            <p className="mb-1 font-medium text-gray-500">Password</p>
                            <div className="mb-4">
                                <input
                                    type="password"
                                    id="signin-password"
                                    className="w-full rounded-md border-2 border-gray-300 px-4 py-2"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            <button
                                onClick={handleSignin}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-3 font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
                            >
                                Sign In
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="mb-1 font-medium text-gray-500">Username</p>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    id="signup-username"
                                    className="w-full rounded-md border-2 border-gray-300 px-4 py-2"
                                    placeholder="Enter your username"
                                />
                            </div>
                            <p className="mb-1 font-medium text-gray-500">Email</p>
                            <div className="mb-4">
                                <input
                                    type="email"
                                    id="signup-email"
                                    className="w-full rounded-md border-2 border-gray-300 px-4 py-2"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <p className="mb-1 font-medium text-gray-500">Password</p>
                            <div className="mb-4">
                                <input
                                    type="password"
                                    id="signup-password"
                                    className="w-full rounded-md border-2 border-gray-300 px-4 py-2"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            <p className="mb-1 font-medium text-gray-500">Retype Password</p>
                            <div className="mb-4">
                                <input
                                    type="password"
                                    id="signup-retype"
                                    className="w-full rounded-md border-2 border-gray-300 px-4 py-2"
                                    placeholder="Retype your password"
                                    required
                                />
                            </div>
                            <button onClick={handleSignup} className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-8 py-3 font-bold text-white transition-all hover:opacity-90 hover:shadow-lg">
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signin;
