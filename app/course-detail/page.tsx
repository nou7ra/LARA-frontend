"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/services/api";

// ✅ الباك بيرجع: type, url, title - مش videoUrl
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
  instructor?: { name: string };
  materials?: Lesson[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/instructor/my-courses`);
        const foundCourse = response.data.courses.find(
          (c: Course) => c._id === courseId
        );

        if (foundCourse) {
          setCourse(foundCourse);
          // ✅ أول فيديو يكون الـ default
          const firstVideo = foundCourse.materials?.find(
            (m: Lesson) => m.type === "video"
          );
          if (firstVideo) setCurrentLesson(firstVideo);
          else if (foundCourse.materials?.length > 0) {
            setCurrentLesson(foundCourse.materials[0]);
          }
        } else {
          setError("Course not found.");
        }
      } catch (err) {
        setError("Failed to load course details.");
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500 text-lg">Loading course...</p>
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
      <p className="text-red-500 text-lg">{error || "Course not found."}</p>
      <Link href="/instructor-home" className="text-orange-500 underline">← Back</Link>
    </div>
  );

  // ✅ فصل الفيديوهات عن الـ PDFs
  const videos = (course.materials || []).filter(m => m.type === "video");
  const pdfs = (course.materials || []).filter(m => m.type === "pdf");

  // ✅ تحويل YouTube رابط عادي لـ embed
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const isYouTube = (url: string) =>
    url?.includes("youtube.com") || url?.includes("youtu.be");

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-8 py-8">
        <section className="grid md:grid-cols-3 gap-8 mb-8">

          {/* ── Video Player ── */}
          <div className="md:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center mb-6">
              {currentLesson?.url ? (
                isYouTube(currentLesson.url) ? (
                  // ✅ YouTube embed
                  <iframe
                    src={getEmbedUrl(currentLesson.url)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  // ✅ Direct video link
                  <video src={currentLesson.url} controls className="w-full h-full" />
                )
              ) : (
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">▶️</div>
                  <p className="text-xl">{currentLesson?.title || "Select a lesson"}</p>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-700 mb-4 leading-relaxed">{course.description}</p>
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Level:</span>
                  <span className="ml-2 font-semibold capitalize">{course.level}</span>
                </div>
                <div>
                  <span className="text-gray-500">Instructor:</span>
                  <span className="ml-2 font-semibold">{course.instructor?.name || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Lessons:</span>
                  <span className="ml-2 font-semibold">{videos.length} 🎬</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-[#FFAE74] to-[#FFF4B7] text-gray-800 font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                Start the course
              </button>
            </div>

            {/* ✅ PDF Materials */}
            {pdfs.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <h3 className="font-bold text-lg mb-4">📄 Course Materials</h3>
                <div className="space-y-2">
                  {pdfs.map((pdf, i) => (
                    <a key={pdf._id} href={pdf.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all">
                      <span className="text-2xl">📄</span>
                      <span className="text-sm font-medium text-gray-700">
                        {pdf.title || `Material ${i + 1}`}
                      </span>
                      <span className="ml-auto text-orange-500 text-xs">Open →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="border-b border-gray-200 mb-4">
                <nav className="flex gap-6">
                  <button onClick={() => setActiveTab("content")}
                    className={`pb-3 ${activeTab === "content" ? "border-b-2 border-orange-500 font-semibold text-orange-600" : "text-gray-600"}`}>
                    About Instructor
                  </button>
                  <button onClick={() => setActiveTab("comments")}
                    className={`pb-3 ${activeTab === "comments" ? "border-b-2 border-orange-500 font-semibold text-orange-600" : "text-gray-600"}`}>
                    Comments
                  </button>
                </nav>
              </div>
              {activeTab === "content" && (
                <p className="text-gray-700 leading-relaxed">
                  {course.instructor?.name || "Instructor"} created this course to help students master the subject step by step.
                </p>
              )}
              {activeTab === "comments" && (
                <div className="text-gray-500 text-center py-6">No comments yet.</div>
              )}
            </div>
          </div>

          {/* ✅ Lessons Sidebar */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit">
            <h3 className="font-bold text-xl mb-4">Course Content</h3>
            {videos.length === 0 ? (
              <p className="text-gray-400 text-sm">No video lessons added yet.</p>
            ) : (
              <div className="space-y-3">
                {videos.map((lesson, index) => (
                  <button key={lesson._id} onClick={() => setCurrentLesson(lesson)}
                    className={`w-full text-left border rounded-lg p-4 transition-all ${
                      currentLesson?._id === lesson._id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300"
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-gray-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="font-semibold text-sm">{lesson.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="text-center">
          <Link href="/instructor-home"
            className="inline-block bg-white text-gray-800 font-semibold py-3 px-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            ← Back
          </Link>
        </div>
      </main>
    </div>
  );
}
