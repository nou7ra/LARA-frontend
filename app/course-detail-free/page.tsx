"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaStar, FaClock, FaGlobe, FaUser, FaPlay, FaChevronUp, FaChevronDown, FaArrowLeft } from "react-icons/fa";
import api from "@/services/api";
import { useRouter } from "next/navigation";

interface Lesson {
  _id: string;
  title: string;
  type: "video" | "pdf";
  url: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  image?: string;
  duration?: string;
  rating?: number;
  price?: number;
  instructor?: { name: string };
  materials?: Lesson[];
}

function StartCourseButton({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    try {
      // ✅ بيبعت courseId في الـ body
      const res = await api.post("/students/enroll", { courseId });
      console.log(res.data.message); // "Enrolled successfully!" أو "Already enrolled"
    } catch (err) {
      console.error("Enroll error:", err);
      // حتى لو في error، كمّل للـ player
    } finally {
      router.push(`/course-player?courseId=${courseId}`);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="shimmer-btn block w-full py-4 px-8 rounded-xl text-white text-lg font-bold text-center shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? "Enrolling..." : "Start the Course 🚀"}
    </button>
  );
}

export default function CourseDetailFreePage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllContent, setShowAllContent] = useState(false);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    const fetchCourse = async () => {
      try {
        const res = await api.get("/students/courses");
        const found = (res.data.courses || []).find((c: Course) => c._id === courseId);
        setCourse(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const videos = (course?.materials || []).filter(m => m.type === "video");
  const displayedVideos = showAllContent ? videos : videos.slice(0, 5);
  const stars = course?.rating ? Math.round(course.rating) : 0;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #FFE5B4, #FFF8E7)" }}>
      <p className="text-gray-500 animate-pulse text-lg">Loading course...</p>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "linear-gradient(to bottom, #FFE5B4, #FFF8E7)" }}>
      <p className="text-red-500 text-lg">Course not found.</p>
      <Link href="/courses-list" className="text-orange-500 underline">Back to Courses</Link>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFE5B4, #FFF8E7, #FFFDF5)" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out forwards; }
        .animate-fadeInRight { animation: fadeInRight 0.6s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.5s ease-out forwards; }
        .shimmer-btn { background: linear-gradient(90deg, #f29633 0%, #ffb347 50%, #f29633 100%); background-size: 200% 100%; }
        .shimmer-btn:hover { animation: shimmer 1.5s infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #fef3c7; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 10px; }
      `}</style>

      {/* Back */}
      <div className="px-8 py-6 animate-slideDown">
        <Link href="/courses-list" className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors group">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Courses</span>
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-16">
        {/* Header */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Image */}
          <div className="animate-fadeInLeft">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer aspect-video bg-orange-100">
              {course.image ? (
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">📚</div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                  <FaPlay className="text-orange-500 text-2xl ml-1" />
                </div>
              </div>
              {/* FREE badge */}
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                🎉 FREE
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="animate-fadeInRight">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{course.title}</h1>

            <div className="space-y-4 mb-6">
              {course.instructor?.name && (
                <div className="flex items-center gap-3">
                  <FaUser className="text-orange-500 text-lg" />
                  <span className="text-gray-600">Instructor:</span>
                  <span className="font-semibold text-gray-800">{course.instructor.name}</span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center gap-3">
                  <FaClock className="text-orange-500 text-lg" />
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold text-gray-800">{course.duration}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <FaGlobe className="text-orange-500 text-lg" />
                <span className="text-gray-600">Level:</span>
                <span className="font-semibold text-gray-800 capitalize">{course.level}</span>
              </div>
              {stars > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <FaStar key={s} className={`text-lg ${s <= stars ? "text-yellow-400" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="font-bold text-gray-800 ml-1">{course.rating?.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="inline-block bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              🎉 FREE COURSE
            </div>
          </div>
        </section>

        {/* Description */}
        {course.description && (
          <section className="mb-12 animate-fadeInUp">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100">
              <h2 className="text-xl font-bold text-gray-800 mb-3">About this Course</h2>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>
          </section>
        )}

        {/* Content + Start */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons list */}
          <div className="lg:col-span-2 animate-fadeInLeft">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Course Content</h2>
                <span className="text-sm text-gray-500">{videos.length} lessons</span>
              </div>

              {videos.length === 0 ? (
                <p className="text-gray-400 text-sm">No lessons available yet.</p>
              ) : (
                <>
                  {videos.length > 5 && (
                    <div className="flex justify-center mb-4">
                      <button onClick={() => setShowAllContent(false)}
                        className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors">
                        <FaChevronUp className="text-orange-600" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {displayedVideos.map((lesson, index) => (
                      <div key={lesson._id}
                        className="flex gap-4 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-300 cursor-pointer group animate-fadeInUp"
                        style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                        <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                          <FaPlay className="text-orange-600 text-xs ml-0.5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">
                            {String(index + 1).padStart(2, "0")}. {lesson.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">Video lesson</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {videos.length > 5 && (
                    <div className="flex justify-center mt-4">
                      <button onClick={() => setShowAllContent(true)}
                        className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors">
                        <FaChevronDown className="text-orange-600" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Start button */}
          <div className="animate-fadeInRight">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Ready to start?</h2>
              <p className="text-gray-500 text-sm mb-4">This course is completely free. Enroll now and start learning!</p>
              <div className="text-3xl font-bold text-green-600 mb-4">FREE 🎉</div>
            </div>

            <StartCourseButton courseId={course._id} />
          </div>
        </section>
      </main>
    </div>
  );
}