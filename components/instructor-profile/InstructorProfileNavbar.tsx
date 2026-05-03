"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const InstructorProfileNavbar: React.FC = () => {
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
    <header
      className="h-[70px] sticky top-0 z-50 flex items-center justify-between px-9 shadow-lg"
      style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="logo hover:scale-105 transition-transform">
          <img src="/images/Home in/Frame 1984077959.png" alt="LARA logo" width={55} height={55} className="rounded-lg" />
        </Link>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search"
            className="w-[190px] px-3.5 py-1.5 rounded-3xl border-none outline-none bg-white text-sm focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>

      <nav className="hidden md:flex gap-5 text-sm">
        <Link href="/instructor-home" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Home</Link>
        <Link href="/dashboard" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Dashboard</Link>
        <Link href="/courses-management" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Courses Management</Link>
        <Link href="/course-builder" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Course Builder</Link>
        <Link href="/student-tracking" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Student Tracking</Link>
      </nav>

      <div className="flex items-center gap-3 relative">
        <div
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden flex items-center justify-center bg-orange-100">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-orange-500 font-bold text-lg">{initial}</span>
            )}
          </div>
        </div>
        <button className="text-xl bg-transparent border-none cursor-pointer hover:scale-110 transition-transform">☰</button>

        {showProfileMenu && (
          <div className="absolute top-[54px] right-0 bg-white rounded-lg shadow-lg min-w-[130px] py-2 z-50 animate-fadeIn">
            <Link href="/instructor-profile" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5] bg-orange-100">Profile</Link>
            <Link href="#" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Settings</Link>
            <Link href="/login" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Logout</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default InstructorProfileNavbar;