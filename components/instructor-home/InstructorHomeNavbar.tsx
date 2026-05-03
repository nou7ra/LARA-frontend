"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBell } from "react-icons/fa";

const InstructorHomeNavbar: React.FC = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [initial, setInitial] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const updateData = () => {
      const savedUser = localStorage.getItem("user");
      const savedImage = localStorage.getItem("profileImage");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setInitial(user.name ? user.name.charAt(0).toUpperCase() : "?");
      }
      if (savedImage) setProfileImage(savedImage);
    };
    updateData();
    window.addEventListener("profileImageUpdated", updateData);
    return () => window.removeEventListener("profileImageUpdated", updateData);
  }, []);

  return (
    <header className="h-[70px] sticky top-0 z-50 flex items-center justify-between px-9 shadow-lg"
      style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
      <div className="flex items-center gap-4">
        <Link href="/instructor-home" className="logo hover:scale-105 transition-transform">
          <Image src="/images/Home in/Frame 1984077959.png" alt="LARA logo" width={55} height={55} className="rounded-lg" />
        </Link>
        <input type="text" placeholder="Search"
          className="w-[190px] px-3.5 py-1.5 rounded-3xl border-none outline-none bg-white text-sm focus:ring-2 focus:ring-orange-300" />
      </div>

      <nav className="hidden md:flex gap-5 text-sm">
        <Link href="/instructor-home" className="text-gray-800 font-semibold border-b-2 border-gray-800 pb-0.5">Home</Link>
        <Link href="/dashboard" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Dashboard</Link>
        <Link href="/courses-management" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Courses Management</Link>
        <Link href="/course-builder" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Course Builder</Link>
        <Link href="/student-tracking" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Student Tracking</Link>
        <Link href="/final-quiz" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Final Quiz</Link>
      </nav>

      <div className="flex items-center gap-4 relative">
        <button className="relative hover:scale-110 transition-transform">
          <FaBell className="text-xl text-gray-700" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
        </button>

        <div onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="cursor-pointer w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-full border-2 border-white shadow-md overflow-hidden flex items-center justify-center bg-white shrink-0 hover:scale-110 transition-transform">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-base select-none" style={{ color: "#ff7b2e" }}>{initial}</span>
          )}
        </div>

        <button className="text-xl bg-transparent border-none cursor-pointer hover:scale-110 transition-transform">☰</button>

        {showProfileMenu && (
          <div className="absolute top-[54px] right-0 bg-white rounded-lg shadow-lg min-w-[130px] py-2 z-50">
            <Link href="/instructor-profile" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Profile</Link>
            <Link href="#" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Settings</Link>
            <Link href="/login" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]"
              onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); }}>Logout</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default InstructorHomeNavbar;