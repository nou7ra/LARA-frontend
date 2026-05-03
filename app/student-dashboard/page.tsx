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
  subcategory?: string;
  category?: string;
  instructor?: { name: string };
  materials?: any[];
  enrolledStudents?: any[];
}

export default function StudentDashboard() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [quizDoneMap, setQuizDoneMap] = useState<Record<string, string | null>>({});
  const [matchRateData, setMatchRateData] = useState<{ name: string; match: number; mismatch: number }[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/students/my-profile");
        const data = res.data.data;
        if (data.name) setStudentName(data.name);
        if (data.fullName) setStudentName(data.fullName);
        if (data.avatar) setAvatarUrl(data.avatar);
      } catch {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user.name) setStudentName(user.name);
          if (user.avatar) setAvatarUrl(user.avatar);
        }
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const [coursesRes, , profileRes, progressRes] = await Promise.all([
          api.get("/students/courses"),
          api.get("/students/recommendation"),
          api.get("/students/my-profile"),
          api.get("/students/my-progress"),
        ]);

        const savedUser = localStorage.getItem("user");
        const userData = savedUser ? JSON.parse(savedUser) : {};
        const userId = userData._id || userData.id || "";

        const allCourses = coursesRes.data.courses || [];
        const progressData = progressRes.data.progressData || [];

        const enrolledCourses = allCourses.filter((c: Course) => {
          const enrolledInAPI = c.enrolledStudents?.some(
            (e: any) => e.student?.toString() === userId || e?.toString() === userId
          );
          if (enrolledInAPI) return true;
          return progressData.find((p: any) => p.courseId.toString() === c._id) !== undefined;
        });

        setCourses(enrolledCourses);

        const map: Record<string, number> = {};
        const quizMap: Record<string, string | null> = {};

        enrolledCourses.forEach((c: Course) => {
          const data = progressData.find((p: any) => p.courseId.toString() === c._id);

          // ✅ جرب كل الـ keys الممكنة
          const localProgress =
            localStorage.getItem(`progress_pct_${userId}_${c._id}`) ||
            localStorage.getItem(`progress_pct_${userData.email}_${c._id}`) ||
            localStorage.getItem(`progress_pct_${userData.id}_${c._id}`);

          const apiProgress = data?.progress || 0;
          const localPct = localProgress ? parseInt(localProgress) : 0;

          // ✅ خد الأعلى
          map[c._id] = Math.max(apiProgress, localPct);

          quizMap[c._id] = data?.quizScore !== null && data?.quizScore !== undefined
            ? String(data.quizScore) : null;
        });

        setProgressMap(map);
        setQuizDoneMap(quizMap);

        // ✅ match rate - بس الكورسات اللي عندها match حقيقي
        const storedMatchMap = localStorage.getItem("courseMatchMap");
        const matchMap: Record<string, number> = storedMatchMap ? JSON.parse(storedMatchMap) : {};

        const missingCourses = enrolledCourses.filter((c: Course) => matchMap[c._id] == null);

        if (missingCourses.length > 0) {
          try {
            const profileData = profileRes.data.data;
            const recRes = await api.post("/api/recommendations/recommend", {
              interests: profileData.interests || [],
              skills: profileData.skills || [],
              previous_courses: profileData.history || [],
              current_level: profileData.level || "beginner",
              exam_score: 60,
              full_name: profileData.fullName || "",
              top_k: 10,
            });

            const recs = recRes.data.recommendations || [];
            recs.forEach((rec: any) => {
              const matched = enrolledCourses.find((c: Course) =>
                c.title?.toLowerCase().includes(rec.subcategory?.toLowerCase()) ||
                rec.subcategory?.toLowerCase().includes(c.title?.toLowerCase())
              );
              if (matched && rec.match_percentage != null) {
                matchMap[matched._id] = rec.match_percentage;
              }
            });

            const existingMap = JSON.parse(localStorage.getItem("courseMatchMap") || "{}");
            const mergedMap = { ...existingMap, ...matchMap };
            localStorage.setItem("courseMatchMap", JSON.stringify(mergedMap));
          } catch (err) {
            console.error("Failed to fetch missing match rates:", err);
          }
        }

        const courseMatchData = enrolledCourses.map((c: Course) => {
          if (matchMap[c._id] == null) return null;
          const matchPct = Math.round(matchMap[c._id]);
          return {
            name: (c.title || "Course").length > 15
              ? (c.title || "Course").slice(0, 15) + "…"
              : (c.title || "Course"),
            match: matchPct,
            mismatch: parseFloat((100 - matchPct).toFixed(1)),
          };
        }).filter(Boolean);

        if (courseMatchData.length > 0) {
          setMatchRateData(courseMatchData as { name: string; match: number; mismatch: number }[]);
          localStorage.setItem("matchRateData", JSON.stringify(courseMatchData));
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

      {/* Header */}
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
          <div
            className="cursor-pointer w-[40px] h-[40px] min-w-[40px] min-h-[40px] rounded-full overflow-hidden shadow-md shrink-0 border-2 border-white"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white flex items-center justify-center font-bold text-base" style={{ color: "#ff7b2e" }}>
                {studentName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {showProfileMenu && (
            <div className="absolute top-[54px] right-0 bg-white rounded-lg shadow-lg min-w-[130px] py-2 z-50">
              <Link href="/profile" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Profile</Link>
              <button
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; }}
                className="block w-full text-left px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]"
              >Logout</button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-fadeInUp">Your Current Progress</h2>

        {loading && <div className="text-center text-gray-400 py-8">Loading your courses...</div>}

        <div className="space-y-6 mb-10">
          {!loading && courses.length === 0 && (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
              <p className="text-gray-400 mb-4">You have not started any courses yet.</p>
              <Link href="/courses" className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition">
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
                  { name: "Ongoing", value: ongoingSlice, color: "#FFCCBC" },
                  { name: "Locked", value: lockedSlice, color: "#FF9800" },
                ].filter(d => d.value > 0);

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
                      <div className="flex justify-between text-xs text-gray-500 mb-4">
                        <span className={pct === 100 ? "text-green-600 font-semibold" : ""}>{pct}% completed</span>
                        <span>{videoCount} lesson{videoCount !== 1 ? "s" : ""}</span>
                      </div>
                      {pct === 100 && (
                        <div className="text-center text-green-600 font-bold text-sm mb-3">✅ Completed!</div>
                      )}
                      {pct === 100 ? (
                        quizScore !== null ? (
                          <div className="flex flex-col gap-2">
                            <div className="block w-full py-2.5 bg-green-50 text-green-600 text-center font-semibold rounded-full border-2 border-green-400 text-sm">
                              ✅ Quiz Done: {quizScore} ✓
                            </div>
                            <Link href={`/course-review?courseId=${course._id}`}
                              className="block w-full py-2.5 bg-white text-gray-600 text-center font-semibold rounded-full border-2 border-gray-300 hover:bg-gray-50 transition text-sm">
                              🔁 Review Course
                            </Link>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Link href={`/quiz?courseId=${course._id}`}
                              className="block w-full py-2.5 bg-white text-orange-500 text-center font-semibold rounded-full border-2 border-orange-500 hover:bg-orange-50 transition text-sm">
                              📝 Take Quiz
                            </Link>
                            <Link href={`/course-review?courseId=${course._id}`}
                              className="block w-full py-2.5 bg-white text-gray-600 text-center font-semibold rounded-full border-2 border-gray-300 hover:bg-gray-50 transition text-sm">
                              🔁 Review Course
                            </Link>
                          </div>
                        )
                      ) : (
                        <Link href={`/course-player?courseId=${course._id}`}
                          className="block w-full py-2.5 bg-white text-orange-500 text-center font-semibold rounded-full border-2 border-orange-500 hover:bg-orange-50 transition text-sm">
                          {pct === 0 ? "▶️ Start" : "▶️ Continue"}
                        </Link>
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 animate-fadeInLeft">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Course-Interest Match Rate</h3>
            {matchRateData.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No enrolled courses yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={matchRateData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="match" name="Match" fill="#FFB347" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="mismatch" name="Mismatch" fill="#E0E0E0" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 flex flex-col items-center justify-center animate-fadeInRight">
            <div className="relative w-48 h-48 mb-4">
              <Image src="/images/Online%20education.png" alt="Explore" fill className="object-contain animate-float" />
            </div>
            <Link href="/courses"
              className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 hover:scale-105 transition-all shadow-lg flex items-center gap-2">
              <FaRocket /> Explore More Courses
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-10 py-8 mt-5" style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div>
            <h4 className="text-[#8B4513] font-bold mb-3">Quick Links</h4>
            <ul className="space-y-1 text-sm text-[#5D4E37]">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/courses">All Courses</Link></li>
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