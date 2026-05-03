"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaRocket, FaBrain, FaUsers, FaGraduationCap, FaChartLine, FaLightbulb } from "react-icons/fa";
import api from "@/services/api";

export default function AboutPage() {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userName, setUserName] = useState("User");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/students/my-profile");
        const data = res.data.data;
        if (data.fullName) setUserName(data.fullName);
        if (data.avatar) setAvatarUrl(data.avatar);
      } catch {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user.name) setUserName(user.name);
          if (user.avatar) setAvatarUrl(user.avatar);
        }
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <style jsx global>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out forwards; }
        .animate-fadeInRight { animation: fadeInRight 0.6s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>

      <header className="h-[70px] sticky top-0 z-50 flex items-center justify-between px-9 shadow-lg"
        style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:scale-105 transition-transform">
            <Image src="/images/about/logo.png" alt="LARA logo" width={55} height={55} className="rounded-lg" />
          </Link>
          <input type="text" placeholder="Search"
            className="w-[190px] px-3.5 py-1.5 rounded-3xl border-none outline-none bg-white text-sm focus:ring-2 focus:ring-orange-300" />
        </div>

        <nav className="hidden md:flex gap-5 text-sm">
          <Link href="/" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Home</Link>
          <Link href="/dashboard" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Dashboard</Link>
          <Link href="/course-player" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Course Player</Link>
          <Link href="/courses" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Recommended Courses</Link>
          <Link href="/quiz" className="text-gray-800 hover:font-semibold hover:text-orange-600 transition-colors">Quiz</Link>
          <Link href="/about" className="text-gray-800 font-semibold border-b-2 border-gray-800 pb-0.5">About</Link>
        </nav>

        <div className="flex items-center gap-4 relative">
          {/* ✅ Avatar */}
          <div
            className="cursor-pointer w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-full overflow-hidden shadow-md shrink-0 border-2 border-white"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center font-bold text-base" style={{ color: "#ff7b2e" }}>
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <button className="text-xl bg-transparent border-none cursor-pointer hover:scale-110 transition-transform"
            onClick={() => setShowMobileNav(!showMobileNav)}>☰</button>

          {showProfileMenu && (
            <div className="absolute top-[54px] right-0 bg-white rounded-lg shadow-lg min-w-[130px] py-2 z-50">
              <Link href="/profile" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Profile</Link>
              <Link href="#" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Settings</Link>
              <Link href="/login" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]"
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); }}>Logout</Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto my-12 mb-20 px-4 relative z-10">
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center mb-20">
          <div className="animate-fadeInLeft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center animate-float shadow-lg">
                <FaGraduationCap className="text-2xl text-white" />
              </div>
              <h1 className="text-[36px] font-bold leading-snug bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Innovative Education
              </h1>
            </div>
            <h2 className="text-[32px] font-bold leading-snug mb-6">with the Power of Artificial Intelligence</h2>
            <p className="text-[16px] text-gray-700 leading-relaxed">
              At Lara, we leverage artificial intelligence to create personalized and engaging learning experiences. Our mission is to empower learners, make education accessible, and inspire a love for lifelong learning.
            </p>
            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <FaBrain className="text-orange-500" />
                <span className="text-sm font-semibold">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
                <FaLightbulb className="text-amber-500" />
                <span className="text-sm font-semibold">Personalized</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center animate-fadeInRight" style={{ animationDelay: "0.2s" }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-amber-300 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <Image src="/images/about/Group 469369.png" alt="Student at desk" width={400} height={400}
                className="w-[90%] max-w-[400px] relative z-10 hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center mb-20">
          <div className="flex justify-center order-2 lg:order-1 animate-fadeInLeft" style={{ animationDelay: "0.1s" }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-purple-300 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <Image src="/images/about/unsplash_uJLJ3a-CnxA.png" alt="AI learning" width={400} height={400}
                className="w-[90%] max-w-[400px] relative z-10 hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
          <div className="order-1 lg:order-2 animate-fadeInRight">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: "0.5s" }}>
                <FaChartLine className="text-xl text-white" />
              </div>
              <h2 className="text-[28px] font-bold leading-snug">Personalized Learning Paths</h2>
            </div>
            <p className="text-[16px] text-gray-700 leading-relaxed">
              Our recommendation engine analyzes each student's learning style, strengths, weaknesses, and educational goals to create unique learning paths. This adaptive approach ensures that every learner receives the most relevant content and resources, enhancing understanding and improving knowledge retention.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center mb-16">
          <div className="animate-fadeInLeft" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: "1s" }}>
                <FaBrain className="text-xl text-white" />
              </div>
              <h2 className="text-[28px] font-bold leading-snug">Instant Help, Always On</h2>
            </div>
            <p className="text-[16px] text-gray-700 leading-relaxed">
              Meet our AI-powered chatbot: your personal learning assistant available 24/7. It provides instant answers to course questions, guides you through challenging concepts, and helps with assignments—ensuring every student can learn smoothly and never feels stuck.
            </p>
          </div>
          <div className="flex justify-center animate-fadeInRight" style={{ animationDelay: "0.2s" }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-teal-300 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <Image src="/images/about/unsplash_d42U7dK0M9w.png" alt="AI assistant robot" width={400} height={400}
                className="w-[90%] max-w-[400px] relative z-10 hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </section>
      </main>

      <footer className="px-10 py-8 mt-5 relative overflow-hidden" style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <Image src="/images/my-courses/logo.png" alt="LARA" width={70} height={70} className="hover:scale-105 transition-transform duration-300 rounded-lg mb-4 md:mb-0" />
          <div className="flex gap-3">
            {["f", "𝕏", "in", "📷", "▶️"].map((icon, i) => (
              <div key={i} className="w-11 h-11 bg-[#d98a47] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{icon}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="rounded-2xl p-5">
            <h4 className="text-[#8B4513] font-bold text-lg mb-4">🚀 Quick Links</h4>
            <ul className="space-y-2 text-sm text-[#5D4E37]">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/courses">All Courses</Link></li>
              <li><Link href="#">Instructors</Link></li>
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl p-5">
            <h4 className="text-[#8B4513] font-bold text-lg mb-4">💬 Support</h4>
            <ul className="space-y-2 text-sm text-[#5D4E37]">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Contact Us</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
              <li><Link href="#">Terms of Use</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl p-5">
            <h4 className="text-[#8B4513] font-bold text-lg mb-4">👤 Account</h4>
            <ul className="space-y-2 text-sm text-[#5D4E37]">
              <li><Link href="/profile">My Profile</Link></li>
              <li><Link href="/my-courses">My Courses</Link></li>
              <li><Link href="#">Settings</Link></li>
              <li><Link href="/login">Sign Out</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl p-5">
            <h4 className="text-[#8B4513] font-bold text-lg mb-4">📞 Contact</h4>
            <p className="text-sm text-[#5D4E37]">📱 +123 456 789</p>
            <p className="text-sm text-[#5D4E37]">✉️ info@lara.com</p>
          </div>
        </div>
        <div className="border-t border-white/30 pt-5">
          <p className="text-center text-sm text-[#5D4E37] font-medium">© 2025 LARA Platform - All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}