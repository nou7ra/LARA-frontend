"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaRocket, FaCheckCircle, FaStar, FaTag, FaClock } from "react-icons/fa";
import api from "@/services/api";

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  image?: string;
  instructor?: { name: string };
  materials?: any[];
  price?: number;
  duration?: string;
  rating?: number;
  studentsCount?: number;
}

export default function CoursesListPage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const recRes = await api.get("/students/recommendation");
        if (recRes.data.recommendations?.length > 0) {
          setCourses(recRes.data.recommendations);
        } else {
          const allRes = await api.get("/students/courses");
          setCourses(allRes.data.courses || []);
        }
      } catch {
        try {
          const allRes = await api.get("/students/courses");
          setCourses(allRes.data.courses || []);
        } catch (err) {
          setError("Failed to load courses.");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const freeCount = courses.filter(c => !c.price || c.price === 0).length;

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
        {/* Header */}
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
                <span className="text-sm font-semibold text-gray-700">{courses.length} Courses Found</span>
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

        {!loading && !error && courses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-gray-400 text-lg mb-4">No matching courses found.</p>
            <Link href="/courses" className="text-orange-500 underline">← Try different interests</Link>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && courses.length > 0 && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => {
              const isFree = !course.price || course.price === 0;
              const stars = course.rating ? Math.round(course.rating) : 0;

              return (
                <article key={course._id}
                  onMouseEnter={() => setHoveredCard(course._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="bg-gradient-to-br from-[#fef3c7] to-[#fde68a] rounded-3xl p-5 text-center shadow-lg cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fadeInUp relative overflow-hidden group"
                  style={{ animationDelay: `${0.1 * (index + 1)}s` }}>

                  {/* FREE badge - top left */}
                  {isFree && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                      FREE
                    </div>
                  )}

                  {/* Stars - top right */}
                  {stars > 0 && (
                    <div className="absolute top-4 right-4 flex gap-0.5 z-10">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={`text-sm ${i < stars ? "text-yellow-400" : "text-gray-300"}`} />
                      ))}
                    </div>
                  )}

                  {/* Decorative circle */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 bg-orange-400 transition-all duration-500 group-hover:scale-150" />

                  {/* Image */}
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 bg-orange-100 flex items-center justify-center shadow-md">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">📚</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold mb-2 text-gray-800">{course.title}</h3>

                  {/* Level */}
                  <span className="inline-block px-4 py-1 rounded-full text-xs font-semibold mb-3 bg-white/60 text-gray-700 capitalize border border-white/80">
                    {course.level}
                  </span>

                  {/* Duration / Rating / Price */}
                  <div className="space-y-2 mb-4 text-sm text-gray-700 text-left px-2">
                    {course.duration && (
                      <p className="flex items-center gap-2">
                        <FaClock className="text-orange-500 flex-shrink-0" />
                        Duration: <strong>{course.duration}</strong>
                      </p>
                    )}
                    {course.rating && course.rating > 0 ? (
                      <p className="flex items-center gap-2">
                        <FaStar className="text-yellow-500 flex-shrink-0" />
                        Rating: <strong>{course.rating.toFixed(2)}</strong>
                        {course.studentsCount && (
                          <span className="text-orange-400 text-xs">({(course.studentsCount / 1000).toFixed(1)}k students)</span>
                        )}
                      </p>
                    ) : null}
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

                  {/* Button */}
                  <Link href={isFree ? `/course-detail-free?courseId=${course._id}` : `/course-detail-paid?courseId=${course._id}`}
                    className={`shimmer-btn no-underline w-full block py-3 px-6 rounded-xl text-white text-sm font-bold transition-all duration-300 shadow-lg ${hoveredCard === course._id ? "shadow-xl scale-105" : ""}`}>
                    View Details →
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
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
