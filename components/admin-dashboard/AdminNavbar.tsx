"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AdminNavbarProps {
  activeTab: "dashboard" | "user-management" | "course-management";
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ activeTab }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminInitial, setAdminInitial] = useState("A");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.name) setAdminInitial(user.name[0].toUpperCase());
    }
  }, []);

  return (
    <header className="py-4 px-8 flex items-center justify-between animate-slideDown">
      {/* Left - Profile Avatar */}
      <div className="relative">
        <div
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-3 border-white">
            {adminInitial}
          </div>
        </div>

        {/* Profile Menu Dropdown */}
        {showProfileMenu && (
          <div className="absolute top-[70px] left-0 bg-white rounded-lg shadow-lg min-w-[150px] py-2 z-50 animate-fadeIn">
            <Link href="/admin-profile" className="block px-4 py-2 text-gray-800 text-sm hover:bg-orange-100">
              Profile
            </Link>
            <Link href="#" className="block px-4 py-2 text-gray-800 text-sm hover:bg-orange-100">
              Settings
            </Link>
            <Link
              href="/login"
              className="block px-4 py-2 text-gray-800 text-sm hover:bg-orange-100"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
              }}
            >
              Logout
            </Link>
          </div>
        )}
      </div>

      {/* Center - Navigation */}
      <nav className="flex gap-8 text-base">
        <Link
          href="/admin-dashboard"
          className={`transition-all ${activeTab === "dashboard"
            ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
            : "text-gray-700 hover:text-blue-600"}`}
        >
          Dashboard
        </Link>
        <Link
          href="/admin-users"
          className={`transition-all ${activeTab === "user-management"
            ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
            : "text-gray-700 hover:text-blue-600"}`}
        >
          User Management
        </Link>
        <Link
          href="/admin-courses"
          className={`transition-all ${activeTab === "course-management"
            ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
            : "text-gray-700 hover:text-blue-600"}`}
        >
          Course Management
        </Link>
      </nav>

      {/* Right - Empty for balance */}
      <div className="w-[60px]" />
    </header>
  );
};

export default AdminNavbar;