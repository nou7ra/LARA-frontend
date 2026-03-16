"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaRocket } from "react-icons/fa";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "@/services/api";

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  image?: string;
  instructor?: { name: string };
  materials?: any[];
}

export default function StudentDashboard() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [quizDoneMap, setQuizDoneMap] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.name) setStudentName(user.name.split(" ")[0]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, recRes] = await Promise.all([
          api.get("/students/courses"),
          api.get("/students/recommendation"),
        ]);

        const savedUser = localStorage.getItem("user");
        const userData = savedUser ? JSON.parse(savedUser) : {};
        const studentId = userData._id || userData.id || userData.email || "guest";

        const allCourses = coursesRes.data.courses || [];

        const enrolledCourses = allCourses.filter((c: Course) => {
          const pct = localStorage.getItem(`progress_pct_${studentId}_${c._id}`);
          return pct !== null && parseInt(pct) > 0;
        });

        setCourses(enrolledCourses);
        setRecommendations(recRes.data.recommendations?.slice(0, 3) || []);

        const map: Record<string, number> = {};
        const quizMap: Record<string, string | null> = {};

        allCourses.forEach((c: Course) => {
          const savedPct = localStorage.getItem(`progress_pct_${studentId}_${c._id}`);
          map[c._id] = savedPct ? parseInt(savedPct) : 0;
          // ✅ اقرأ نتيجة الكويز من localStorage
          quizMap[c._id] = localStorage.getItem(`quiz_done_${c._id}`);
        });

        setProgressMap(map);
        setQuizDoneMap(quizMap);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const matchRateData = recommendations.length > 0
    ? [{ name: "Match", rate: 1.0 }, { name: "Mismatch", rate: 0 }]
    : [{ name: "Match", rate: 0.5 }, { name: "Mismatch", rate: 0.5 }];

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out forwards; }
        .animate-fadeInRight { animation: fadeInRight 0.6s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>

      <header className="h-[70px] sticky top-0 z-50 flex items-center justify-between px-9 shadow-lg"
        style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="flex items-center gap-4">
          <Link href="/"><Image src="/images/about/logo.png" alt="LARA" width={55} height={55} className="rounded-lg" /></Link>
          <input type="text" placeholder="Search"
            className="w-[190px] px-3.5 py-1.5 rounded-3xl border border-gray-200 outline-none bg-white text-sm" />
        </div>
        <nav className="hidden md:flex gap-5 text-sm">
          <Link href="/my-courses" className="text-gray-800 hover:font-semibold">Home</Link>
          <Link href="/student-dashboard" className="text-gray-800 font-semibold border-b-2 border-orange-500 pb-0.5">Dashboard</Link>
          <Link href="/courses" className="text-gray-800 hover:font-semibold">Recommended Courses</Link>
          <Link href="/quiz" className="text-gray-800 hover:font-semibold">Quiz</Link>
        </nav>
        <div className="flex items-center gap-4 relative">
          <div className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <Image src="/images/dashboard/Ellipse%2068.png" alt="Profile" width={40} height={40} className="rounded-full border-2 border-white shadow-md" />
          </div>
          {showProfileMenu && (
            <div className="absolute top-[54px] right-0 bg-white rounded-lg shadow-lg min-w-[130px] py-2 z-50">
              <Link href="/profile" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Profile</Link>
              <Link href="/login" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]"
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); }}>Logout</Link>
            </div>
          )}
        </div>
      </header>

      <section className="py-8 px-8" style={{ background: "linear-gradient(to right, #ffb45a, #87CEEB)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="animate-fadeInLeft">
            <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-2">Welcome,</h1>
            <h2 className="text-4xl md:text-5xl font-bold text-orange-500">{studentName}!</h2>
          </div>
          <div className="animate-fadeInRight hidden md:block">
            <Image src="/images/dashboard/People%20working%20together%20in%20coworking%20space.png"
              alt="Student" width={350} height={280} className="animate-float" />
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-fadeInUp">Your Current Progress</h2>

        {loading && <div className="text-center text-gray-400 py-8">Loading your courses...</div>}

        <div className="space-y-6 mb-10">
          {!loading && courses.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
              <p className="text-gray-400 mb-4">You have not started any courses yet.</p>
              <Link href="/courses-list" className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
                Browse Courses
              </Link>
            </div>
          )}

          {!loading && courses.map((course, index) => {
            const pct = progressMap[course._id] || 0;
            const videoCount = (course.materials || []).filter((m: any) => m.type === "video").length;
            const completedCount = Math.round((pct / 100) * videoCount);
            const quizScore = quizDoneMap[course._id];

            const ongoingSlice = pct > 0 && pct < 100 ? 5 : 0;
            const completedSlice = pct;
            const lockedSlice = Math.max(0, 100 - completedSlice - ongoingSlice);

            const finalPie = pct === 0
              ? [{ name: "Not Started", value: 100, color: "#E0E0E0" }]
              : [
                  { name: "Completed", value: completedSlice, color: "#FFE0B2" },
                  { name: "Ongoing",   value: ongoingSlice,   color: "#FFCCBC" },
                  { name: "Locked",    value: lockedSlice,    color: "#FF9800" },
                ].filter(d => d.value > 0);

            const btnLabel = pct === 100 ? "Review Course" : pct > 0 ? "Continue Learning" : "View Course";

            return (
              <div key={course._id}
                className="bg-white rounded-2xl border-2 border-gray-200 p-6 flex flex-col lg:flex-row items-center gap-8 hover:shadow-xl transition-shadow animate-fadeInUp"
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}>

                <div className="flex-shrink-0 w-full lg:w-auto">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full lg:w-64">
                    <div className="relative h-40 bg-orange-100 flex items-center justify-center">
                      {course.image ? (
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">📚</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-gray-500 text-sm mb-3">{course.instructor?.name || "Instructor"}</p>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-1">
                        <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: "linear-gradient(to right, #FF6B00, #FFB347)" }} />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span className={pct === 100 ? "text-green-600 font-semibold" : ""}>{pct}% completed</span>
                        <span>{videoCount} lesson{videoCount !== 1 ? "s" : ""}</span>
                      </div>
                      {pct === 100 && (
                        <div className="text-center text-green-600 font-bold text-sm mb-2">✅ Completed!</div>
                      )}

                      <Link href={pct === 100 ? `/course-review?courseId=${course._id}` : `/course-player?courseId=${course._id}`}
                        className="block w-full py-2.5 bg-orange-500 text-white text-center font-semibold rounded-full hover:bg-orange-600 transition">
                        {btnLabel}
                      </Link>

                      {/* ✅ لو خلّص الكويز اعرض الدرجة، لو لسه اعرض الزرار */}
                      {pct === 100 && (
                        quizScore !== null ? (
                          <div className="block w-full py-2.5 mt-2 bg-green-50 text-green-600 text-center font-semibold rounded-full border-2 border-green-400">
                            ✅ Quiz Done: {quizScore} ✓
                          </div>
                        ) : (
                          <Link href={`/quiz?courseId=${course._id}`}
                            className="block w-full py-2.5 mt-2 bg-white text-orange-500 text-center font-semibold rounded-full border-2 border-orange-500 hover:bg-orange-50 transition">
                            📝 Take Quiz
                          </Link>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Your Progress in {course.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{completedCount} of {videoCount} lessons completed</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={finalPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {finalPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, name) => [`${v}%`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2 flex-wrap">
                    {finalPie.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 animate-fadeInLeft">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Course-Interest Match Rate</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={matchRateData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1.2]} tickFormatter={(v) => v.toFixed(1)} />
                <Tooltip formatter={(v) => `${(Number(v) * 100).toFixed(1)}%`} />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                  {matchRateData.map((_, i) => <Cell key={i} fill={i === 0 ? "#FFB347" : "#E0E0E0"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 flex flex-col items-center justify-center animate-fadeInRight">
            <div className="relative w-48 h-48 mb-4">
              <Image src="/images/Online%20education.png" alt="Explore" fill className="object-contain animate-float" />
            </div>
            <Link href="/courses-list"
              className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 hover:scale-105 transition-all shadow-lg flex items-center gap-2">
              <FaRocket /> Explore More Courses
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-10 py-8 mt-5" style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div>
            <h4 className="text-[#8B4513] font-bold mb-3">Quick Links</h4>
            <ul className="space-y-1 text-sm text-[#5D4E37]">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/courses-list">All Courses</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#8B4513] font-bold mb-3">Support</h4>
            <ul className="space-y-1 text-sm text-[#5D4E37]">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#8B4513] font-bold mb-3">Account</h4>
            <ul className="space-y-1 text-sm text-[#5D4E37]">
              <li><Link href="/profile">My Profile</Link></li>
              <li><Link href="/login">Sign Out</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[#8B4513] font-bold mb-3">Contact</h4>
            <p className="text-sm text-[#5D4E37]">info@lara.com</p>
          </div>
        </div>
        <p className="text-center text-sm text-[#5D4E37]">2025 LARA Platform. All Rights Reserved</p>
      </footer>

      <Link href="/chatbot" className="fixed right-10 bottom-10 z-30">
        <Image src="/images/my-courses/unsplash_d42U7dK0M9w.png" alt="ChatBot" width={70} height={70}
          className="cursor-pointer hover:scale-110 transition-transform rounded-full shadow-lg animate-bounce" />
      </Link>
    </div>
  );
}