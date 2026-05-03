"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FaRocket, FaCheckCircle, FaStar, FaTag, FaClock } from "react-icons/fa";
import api from "@/services/api";

interface AIRecommendation {
  course_id: number;
  category: string;
  subcategory: string;
  level: string;
  avg_rating: number;
  duration_h: number;
  duration_display?: string;
  price_usd: number;
  final_score: number;
  match_percentage?: number;
  image?: string | null;
  _mongoId?: string | null;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  image?: string;
  instructor?: { name: string };
  price?: number;
  duration?: string;
  rating?: number;
  studentsCount?: number;
}

function MatchChart({ percentage }: { percentage: number }) {
  const mismatch = Math.round(100 - percentage);
  const match = Math.round(percentage);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const matchOffset = circumference - (match / 100) * circumference;

  return (
    <div
      className="rounded-2xl px-3 pt-3 pb-2 mb-3 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div style={{
        position: "absolute", top: "-10px", right: "-10px",
        width: "70px", height: "70px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <p className="text-[7px] font-black text-center mb-2 tracking-[0.2em] uppercase"
        style={{ color: "rgba(251,191,36,0.7)" }}>
        ◈ Match Rate ◈
      </p>

      <div className="flex items-center justify-center gap-4">
        <div className="relative flex items-center justify-center" style={{ width: "72px", height: "72px" }}>
          <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
            <defs>
              <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>
            <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <circle cx="36" cy="36" r={radius} fill="none" stroke="url(#orangeGrad)" strokeWidth="7"
              strokeDasharray={circumference} strokeDashoffset={0} strokeLinecap="round" />
            <circle cx="36" cy="36" r={radius} fill="none" stroke="url(#greenGrad)" strokeWidth="7"
              strokeDasharray={circumference} strokeDashoffset={matchOffset} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }} />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[15px] font-black leading-none" style={{ color: "#34d399" }}>{match}%</span>
            <span className="text-[6px] font-bold tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>MATCH</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "radial-gradient(circle, #6ee7b7, #059669)", boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
            <div>
              <p className="text-[8px] font-bold leading-none" style={{ color: "rgba(255,255,255,0.4)" }}>Match</p>
              <p className="text-[13px] font-black leading-none" style={{ color: "#34d399" }}>{match}%</p>
            </div>
          </div>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "999px" }} />
          <div className="flex items-center gap-2">
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "radial-gradient(circle, #fed7aa, #ea580c)", boxShadow: "0 0 6px rgba(234,88,12,0.8)" }} />
            <div>
              <p className="text-[8px] font-bold leading-none" style={{ color: "rgba(255,255,255,0.4)" }}>Mismatch</p>
              <p className="text-[13px] font-black leading-none" style={{ color: "#fb923c" }}>{mismatch}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function matchDbCourse(dbCourses: any[], rec: AIRecommendation, targetLevel: string) {
  const levelPriority = ["advanced", "intermediate", "beginner"];
  const startIndex = levelPriority.indexOf(targetLevel.toLowerCase());
  const levelsToTry = startIndex >= 0 ? levelPriority.slice(startIndex) : levelPriority;

  for (const level of levelsToTry) {
    const found = dbCourses.find((c: any) =>
      c.level?.toLowerCase() === level &&
      (c.subcategory?.toLowerCase() === rec.subcategory?.toLowerCase() ||
        c.title?.toLowerCase().includes(rec.subcategory?.toLowerCase()) ||
        rec.subcategory?.toLowerCase().includes(c.title?.toLowerCase()))
    );
    if (found) return found;
  }

  for (const level of levelsToTry) {
    const found = dbCourses.find((c: any) =>
      c.level?.toLowerCase() === level &&
      c.category?.toLowerCase() === rec.category?.toLowerCase()
    );
    if (found) return found;
  }

  return null;
}

function CoursesListContent() {
  const searchParams = useSearchParams();
  const levelFromUrl = searchParams.get("level");
  const scoreFromUrl = searchParams.get("score");

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [aiRecs, setAiRecs] = useState<AIRecommendation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {

      if (levelFromUrl) {
        try {
          const profileRes = await api.get("/students/my-profile");
          const profile = profileRes.data.data;

          const recResponse = await api.post("/api/recommendations/recommend", {
            interests: profile.interests || [],
            skills: profile.skills || [],
            previous_courses: profile.history || [],
            current_level: levelFromUrl,
            exam_score: scoreFromUrl ? parseInt(scoreFromUrl) : 60,
            full_name: profile.fullName || "",
            top_k: 5,
          });

          const allRecs = recResponse.data.recommendations || [];
          const dbRes = await api.get("/students/courses");
          const dbCourses: Course[] = dbRes.data.courses || [];

          const matched = allRecs.map((rec: AIRecommendation) => {
            const dbCourse = matchDbCourse(dbCourses, rec, levelFromUrl);
            return {
              ...rec,
              image: dbCourse?.image || null,
              price_usd: dbCourse?.price ?? rec.price_usd,
              duration_h: dbCourse?.duration ? parseFloat(dbCourse.duration) : rec.duration_h,
              duration_display: dbCourse?.duration ?? null,
              level: dbCourse?.level || rec.level,
              _mongoId: dbCourse?._id || null,
            };
          });

          setAiRecs(matched);

          // ✅ التعديل - مكان 1: احفظي بشكل تراكمي
          const matchMap: Record<string, number> = {};
          matched.forEach((rec: any) => {
            if (rec._mongoId && rec.match_percentage != null) {
              matchMap[rec._mongoId] = rec.match_percentage;
            }
          });
          const existingMap1 = JSON.parse(localStorage.getItem("courseMatchMap") || "{}");
          const mergedMap1 = { ...existingMap1, ...matchMap };
          localStorage.setItem("courseMatchMap", JSON.stringify(mergedMap1));

        } catch {
          setError("Failed to load recommendations.");
        } finally {
          setLoading(false);
        }
        return;
      }

      const stored = localStorage.getItem("recommendations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          try {
            const dbRes = await api.get("/students/courses");
            const dbCourses: Course[] = dbRes.data.courses || [];

            const matched = parsed.map((rec: AIRecommendation) => {
              const dbCourse = matchDbCourse(dbCourses, rec, "beginner");
              return {
                ...rec,
                image: dbCourse?.image || null,
                price_usd: dbCourse?.price ?? rec.price_usd,
                duration_h: dbCourse?.duration ? parseFloat(dbCourse.duration) : rec.duration_h,
                duration_display: dbCourse?.duration ?? null,
                level: dbCourse?.level || rec.level,
                _mongoId: dbCourse?._id || null,
              };
            });

            setAiRecs(matched);

            // ✅ التعديل - مكان 2: احفظي بشكل تراكمي
            const matchMap: Record<string, number> = {};
            matched.forEach((rec: any) => {
              if (rec._mongoId && rec.match_percentage != null) {
                matchMap[rec._mongoId] = rec.match_percentage;
              }
            });
            const existingMap2 = JSON.parse(localStorage.getItem("courseMatchMap") || "{}");
            const mergedMap2 = { ...existingMap2, ...matchMap };
            localStorage.setItem("courseMatchMap", JSON.stringify(mergedMap2));

          } catch {
            setAiRecs(parsed);
          }
          setLoading(false);
          return;
        }
      }

      try {
        const allRes = await api.get("/students/courses");
        setCourses(allRes.data.courses || []);
      } catch (err) {
        setError("Failed to load courses.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [levelFromUrl, scoreFromUrl]);

  const freeCount = aiRecs.length > 0
    ? aiRecs.filter(r => r.price_usd === 0).length
    : courses.filter(c => !c.price || c.price === 0).length;

  const totalCount = aiRecs.length > 0 ? aiRecs.length : courses.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .shimmer-btn { background: linear-gradient(90deg, #f29633 0%, #ffb347 50%, #f29633 100%); background-size: 200% 100%; }
        .shimmer-btn:hover { animation: shimmer 1.5s infinite; }
      `}</style>

      <section className="w-full py-12 px-5 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto mb-12">
          <div className="text-center py-6 px-8 rounded-2xl shadow-xl animate-fadeInDown"
            style={{ background: "linear-gradient(135deg, #f9c26c 0%, #ffdb80 50%, #f6f3b0 100%)" }}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center animate-float">
                <FaRocket className="text-2xl text-orange-600" />
              </div>
              <h2 className="text-[32px] font-bold text-gray-800">Recommended Courses for You</h2>
            </div>
            <p className="text-gray-700 text-sm">AI-powered recommendations based on your interests and skills ✨</p>
          </div>

          {!loading && (
            <div className="flex justify-center gap-4 mt-6 animate-fadeInUp flex-wrap">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-md">
                <FaCheckCircle className="text-green-500" />
                <span className="text-sm font-semibold text-gray-700">{totalCount} Courses Found</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-md">
                <FaStar className="text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700">Top Rated</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-md">
                <FaTag className="text-orange-500" />
                <span className="text-sm font-semibold text-gray-700">{freeCount} Free Courses</span>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 animate-bounce">🔍</div>
            <p className="text-gray-500 text-lg">Finding courses for you...</p>
          </div>
        )}

        {error && <div className="text-center py-16"><p className="text-red-500">{error}</p></div>}

        {!loading && !error && totalCount === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-gray-400 text-lg mb-4">No matching courses found.</p>
            <Link href="/courses" className="text-orange-500 underline">← Try different interests</Link>
          </div>
        )}

        {!loading && !error && aiRecs.length > 0 && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiRecs.map((rec, index) => {
              const isFree = rec.price_usd === 0;
              const cardId = String(rec.course_id);

              return (
                <article key={rec.course_id}
                  onMouseEnter={() => setHoveredCard(cardId)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-3xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fadeInUp relative group"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}>

                  {isFree && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">FREE</div>
                  )}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 bg-orange-400 transition-all duration-500 group-hover:scale-150" />

                  <div className="w-full h-40 overflow-hidden bg-orange-100 flex items-center justify-center">
                    {rec.image ? (
                      <img src={rec.image} alt={rec.subcategory} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">📚</span>
                    )}
                  </div>

                  <div className="p-5 text-center">
                    <h3 className="text-lg font-bold mb-1 text-gray-800 capitalize">{rec.subcategory}</h3>
                    <p className="text-xs text-gray-500 mb-2 capitalize">{rec.category}</p>
                    <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-3 bg-white/60 text-gray-700 capitalize border border-white/80">
                      {rec.level}
                    </span>

                    {rec.match_percentage != null && (
                      <MatchChart percentage={rec.match_percentage} />
                    )}

                    <div className="space-y-2 mb-4 text-sm text-gray-700 text-left px-2">
                      <p className="flex items-center gap-2">
                        <FaClock className="text-orange-500 flex-shrink-0" />
                        Duration: <strong>{rec.duration_display ?? `${rec.duration_h}h`}</strong>
                      </p>
                      <p className="flex items-center gap-2">
                        <FaTag className="text-green-500 flex-shrink-0" />
                        Price:{" "}
                        {isFree ? (
                          <span className="text-green-600 font-bold">FREE 🎉</span>
                        ) : (
                          <strong className="text-orange-600">${rec.price_usd}</strong>
                        )}
                      </p>
                    </div>

                    <Link
                      href="/course-detail-free"
                      onClick={() => localStorage.setItem("selectedCourse", JSON.stringify(rec))}
                      className={`shimmer-btn no-underline w-full block py-3 px-6 rounded-xl text-white text-sm font-bold transition-all duration-300 shadow-lg ${hoveredCard === cardId ? "shadow-xl scale-105" : ""}`}>
                      View Details →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && aiRecs.length === 0 && courses.length > 0 && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => {
              const isFree = !course.price || course.price === 0;

              return (
                <article key={course._id}
                  onMouseEnter={() => setHoveredCard(course._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-3xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fadeInUp relative group"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}>

                  {isFree && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">FREE</div>
                  )}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 bg-orange-400 transition-all duration-500 group-hover:scale-150" />

                  <div className="w-full h-40 overflow-hidden bg-orange-100 flex items-center justify-center">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">📚</span>
                    )}
                  </div>

                  <div className="p-5 text-center">
                    <h3 className="text-lg font-bold mb-2 text-gray-800">{course.title}</h3>
                    <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-3 bg-white/60 text-gray-700 capitalize border border-white/80">
                      {course.level}
                    </span>

                    <div className="space-y-2 mb-4 text-sm text-gray-700 text-left px-2">
                      {course.duration && (
                        <p className="flex items-center gap-2">
                          <FaClock className="text-orange-500 flex-shrink-0" />
                          Duration: <strong>{course.duration}</strong>
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <FaTag className="text-green-500 flex-shrink-0" />
                        Price:{" "}
                        {isFree ? (
                          <span className="text-green-600 font-bold">FREE 🎉</span>
                        ) : (
                          <strong className="text-orange-600">{course.price} EGP</strong>
                        )}
                      </p>
                    </div>

                    <Link href={isFree ? `/course-detail-free?courseId=${course._id}` : `/course-detail-paid?courseId=${course._id}`}
                      className={`shimmer-btn no-underline w-full block py-3 px-6 rounded-xl text-white text-sm font-bold transition-all duration-300 shadow-lg ${hoveredCard === course._id ? "shadow-xl scale-105" : ""}`}>
                      View Details →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="max-w-6xl mx-auto mt-12 text-center animate-fadeInUp" style={{ animationDelay: "0.8s" }}>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Want better recommendations?</h3>
            <p className="text-gray-600 mb-4">Update your interests to get more personalized courses</p>
            <Link href="/courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <FaRocket /> Update Preferences
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CoursesListPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoursesListContent />
    </Suspense>
  );
}