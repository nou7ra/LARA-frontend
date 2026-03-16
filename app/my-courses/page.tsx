"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaClock, FaStar, FaTag } from "react-icons/fa";
import api from "@/services/api";

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  image?: string;
  instructor?: { name: string };
  price?: number;
  duration?: string;
  studentsCount?: number;
  reviews?: { rating: number; comment: string; date: string }[];
}

interface Session {
  _id: string;
  title: string;
  courseTitle: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  price?: number;
}

export default function MyCoursesPage() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSessionsMenu, setShowSessionsMenu] = useState(false);
  const [studentName, setStudentName] = useState("Student");
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.name) setStudentName(user.name);
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/students/courses");
        setRecommendedCourses(res.data.courses?.slice(0, 6) || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/students/sessions");
        const todayMidnight = new Date();
        todayMidnight.setHours(0, 0, 0, 0);
        const upcoming = (res.data.sessions || [])
          .filter((s: Session) => {
            const [y, m, d] = s.date.split("T")[0].split("-").map(Number);
            return new Date(y, m - 1, d) >= todayMidnight;
          })
          .sort((a: Session, b: Session) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        setSessions(upcoming);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };
    fetchSessions();
  }, []);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* HEADER */}
      <header className="h-[70px] sticky top-0 z-20 flex items-center justify-between px-9"
        style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="flex items-center gap-4">
          <Image src="/images/my-courses/logo.png" alt="LARA logo" width={55} height={55} />
          <input type="text" placeholder="Search"
            className="w-[190px] px-3.5 py-1.5 rounded-3xl border-none outline-none bg-white text-sm" />
        </div>

        <nav className="hidden md:flex gap-5 text-sm items-center">
          <Link href="/my-courses" className="text-gray-800 font-semibold border-b-2 border-gray-800 pb-0.5">Home</Link>
          <Link href="/student-dashboard" className="text-gray-800 hover:font-semibold">Dashboard</Link>
          <Link href="/course-player" className="text-gray-800 hover:font-semibold">Course Player</Link>
          <Link href="/courses" className="text-gray-800 hover:font-semibold">Recommended Courses</Link>
          <Link href="/quiz" className="text-gray-800 hover:font-semibold">Quiz</Link>

          {/* Sessions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSessionsMenu(!showSessionsMenu)}
              className="flex items-center gap-1.5 text-gray-800 hover:font-semibold"
            >
              Sessions
              <span className="text-xs">{showSessionsMenu ? "▲" : "▼"}</span>
            </button>

            {showSessionsMenu && (
              <div className="absolute top-[48px] left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl w-[300px] z-50 overflow-hidden"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>

                <div className="px-5 py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <h4 className="text-white font-bold text-sm tracking-wide">Upcoming Sessions</h4>
                  <span className="ml-auto bg-white/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {sessions.length}
                  </span>
                </div>

                {sessions.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-3xl mb-2">📭</p>
                    <p className="text-gray-400 text-sm">No upcoming sessions.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
                    {sessions.map((s) => {
                      const dateObj = new Date(s.date.split("T")[0] + "T00:00:00");
                      const day = dateObj.getDate();
                      const month = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
                      return (
                        <Link key={s._id} href={`/payment?courseId=${s._id}&price=${s.price || 0}`}
                          className="flex items-center gap-3 px-4 py-3.5 hover:bg-orange-50 transition-all group"
                          onClick={() => setShowSessionsMenu(false)}>
                          <div className="flex-shrink-0 w-11 h-14 bg-gradient-to-b from-orange-500 to-orange-600 rounded-xl flex flex-col items-center justify-center shadow-md">
                            <span className="text-white text-lg font-black leading-none">{day}</span>
                            <span className="text-white text-[9px] font-bold tracking-widest">{month}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">{s.title}</p>
                            <p className="text-xs text-orange-400 font-medium truncate">{s.courseTitle}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">🕐 {s.timeStart} – {s.timeEnd}</p>
                            {s.price !== undefined && s.price > 0 && (
                              <p className="text-[11px] text-orange-500 font-bold mt-0.5">
                                {s.price} EGP
                              </p>
                            )}
                          </div>
                          <span className="text-orange-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all text-base">›</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                <div className="px-4 py-3 border-t border-orange-50 bg-gradient-to-r from-orange-50 to-amber-50">
                  <Link href="/sessions" onClick={() => setShowSessionsMenu(false)}
                    className="flex items-center justify-center gap-1.5 text-xs text-orange-500 font-bold hover:text-orange-700 transition-colors">
                    View All Sessions
                    <span className="text-base leading-none">→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/about" className="text-gray-800 hover:font-semibold">About</Link>
        </nav>

        <div className="flex items-center gap-3 relative">
          <div className="cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <Image src="/images/my-courses/Ellipse 68 (1).png" alt="Profile" width={34} height={34} className="rounded-full object-cover" />
          </div>
          <button className="text-xl bg-transparent border-none cursor-pointer">☰</button>
          {showProfileMenu && (
            <div className="absolute top-[54px] right-0 bg-white rounded-lg shadow-lg min-w-[130px] py-2">
              <Link href="/profile" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Profile</Link>
              <Link href="#" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]">Setting</Link>
              <Link href="/login" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]"
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); }}>
                Logout
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* HERO */}
      <section className="bg-[#ffe9b9]">
        <div className="max-w-[1150px] mx-auto flex flex-col md:flex-row justify-between items-center px-3 py-8 md:py-10">
          <div className="max-w-[470px] text-center md:text-left mb-6 md:mb-0">
            <p className="text-xl text-[#ff8b2b] mb-1">Welcome,</p>
            <h1 className="text-[38px] leading-tight font-bold mb-3.5">{studentName}! 👋</h1>
            <p className="text-sm text-gray-700 mb-6 max-w-[360px] mx-auto md:mx-0">
              Access courses tailored for your career and personal growth.
            </p>
            <Link href="/course-player"
              className="inline-block px-7 py-3 rounded-3xl bg-[#ff7b2e] text-white font-semibold hover:bg-[#e66b1e] transition-colors">
              Go to My Courses
            </Link>
          </div>
          <div className="hidden md:flex justify-center items-center">
            <div className="relative w-80 h-80">
              <div className="w-full h-full rounded-full bg-white flex justify-center items-center border-8 border-white shadow-2xl"
                style={{ boxShadow: "0 0 0 16px #ffd39b" }}>
                <Image src="/images/my-courses/Frame 1984077640.png" alt="Student" width={310} height={300} className="rounded-full object-cover" />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl animate-bounce">❤️</div>
              <div className="absolute bottom-8 -right-8 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-lg animate-bounce" style={{ animationDelay: "0.5s" }}>⭐</div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-[1150px] mx-auto px-3 pt-8 pb-16">

        {/* Most Popular Categories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">
            <span className="text-[#0b9152]">Most Popular</span> Categories
          </h2>

          {loadingCourses && <div className="text-center text-gray-400 py-8">Loading courses...</div>}
          {!loadingCourses && recommendedCourses.length === 0 && (
            <div className="text-center text-gray-400 py-8">No courses available yet.</div>
          )}

          {!loadingCourses && recommendedCourses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCourses.map((course) => {
                const isFree = !course.price || course.price === 0;
                const reviews = course.reviews || [];
                const avgRating = reviews.length > 0
                  ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
                  : 0;

                return (
                  <article key={course._id}
                    className="bg-gradient-to-br from-[#fff6cf] to-[#ffe9b9] rounded-2xl p-4 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-orange-100 relative overflow-hidden">

                    {isFree && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">FREE</div>
                    )}
                    {avgRating > 0 && (
                      <div className="absolute top-3 right-3 flex gap-0.5 z-10">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FaStar key={s} className={`text-xs ${s <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    )}

                    <div className="overflow-hidden rounded-xl mb-3 h-40 bg-orange-100 flex items-center justify-center">
                      {course.image ? (
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">📚</span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold mb-1">{course.title}</h3>
                    <p className="text-[13px] text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                    <div className="space-y-1.5 mb-3 text-sm">
                      {course.duration && (
                        <p className="flex items-center gap-2 text-gray-600">
                          <FaClock className="text-orange-500 flex-shrink-0" />
                          Duration: <strong>{course.duration}</strong>
                        </p>
                      )}
                      {avgRating > 0 ? (
                        <p className="flex items-center gap-2 text-gray-600">
                          <FaStar className="text-yellow-500 flex-shrink-0" />
                          Rating: <strong>{avgRating.toFixed(1)}</strong>
                          <span className="text-orange-400 text-xs">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                        </p>
                      ) : (
                        <p className="flex items-center gap-2 text-gray-400 text-xs">
                          <FaStar className="flex-shrink-0" />No reviews yet
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-gray-600">
                        <FaTag className="text-green-500 flex-shrink-0" />
                        Price:{" "}
                        {isFree
                          ? <span className="text-green-600 font-bold">FREE 🎉</span>
                          : <strong className="text-orange-600">{course.price} EGP</strong>}
                      </p>
                    </div>

                    <div className="flex items-center mt-2">
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full capitalize">{course.level}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Best Instructors */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#0b9152]">Our Best Instructors</h2>
          <div className="flex items-center gap-2.5">
            <button className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-lg">‹</button>
            <div className="flex overflow-x-auto gap-3.5 scroll-smooth p-1">
              {[
                { img: "image 13.png", name: "Ibrahim Adel", role: "English" },
                { img: "88.png", name: "Paul Bullem", role: "Registered Nutritionist" },
                { img: "'p;.png", name: "Osama Mohammed", role: "Software engineer" },
                { img: ",m.png", name: "Ehab Fayez", role: "UI/UX Designer" },
              ].map((inst, idx) => (
                <article key={idx} className="min-w-[170px] max-w-[170px] bg-white rounded-2xl p-3 text-center shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                  <div className="overflow-hidden rounded-xl mb-2.5">
                    <Image src={`/images/my-courses/${inst.img}`} alt={inst.name} width={170} height={170} className="w-full" />
                  </div>
                  <h3 className="text-sm font-semibold mb-0.5">{inst.name}</h3>
                  <p className="text-xs text-gray-600">{inst.role}</p>
                </article>
              ))}
            </div>
            <button className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-lg">›</button>
          </div>
        </section>

        <Link href="/chatbot" className="fixed right-10 bottom-10 z-30">
          <Image src="/images/my-courses/unsplash_d42U7dK0M9w.png" alt="ChatBot" width={70} height={70}
            className="cursor-pointer hover:scale-110 transition-transform rounded-full shadow-lg animate-bounce" />
        </Link>
      </main>

      {/* FOOTER */}
      <footer className="px-10 py-8 mt-5" style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="flex justify-between items-center mb-8">
          <Image src="/images/my-courses/logo.png" alt="LARA" width={70} height={70} className="rounded-lg" />
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
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl p-5">
            <h4 className="text-[#8B4513] font-bold text-lg mb-4">💬 Support</h4>
            <ul className="space-y-2 text-sm text-[#5D4E37]">
              <li><Link href="#">Help Center</Link></li>
              <li><Link href="#">Contact Us</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl p-5">
            <h4 className="text-[#8B4513] font-bold text-lg mb-4">👤 Account</h4>
            <ul className="space-y-2 text-sm text-[#5D4E37]">
              <li><Link href="/profile">My Profile</Link></li>
              <li><Link href="/my-courses">My Courses</Link></li>
              <li><Link href="/login">Sign Out</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl p-5">
            <h4 className="text-[#8B4513] font-bold text-lg mb-4">📞 Contact</h4>
            <p className="text-sm text-[#5D4E37]">📱 +123 456 789</p>
            <p className="text-sm text-[#5D4E37]">✉️ info@lara.com</p>
          </div>
        </div>
        <p className="text-center text-sm text-[#5D4E37]">© 2025 LARA Platform - All Rights Reserved</p>
      </footer>
    </div>
  );
}