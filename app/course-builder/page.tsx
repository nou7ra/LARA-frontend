"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";
import {
  CourseBuilderNavbar,
  CourseHeader,
  CourseBuilderFooter,
} from "@/components/course-builder";

interface Lesson {
  id: number;
  title: string;
  module: string;
  videoUrl: string;
  pdfUrl: string;
}

export default function CourseBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [activeTab, setActiveTab] = useState<"content" | "quiz">("content");
  const [selectedModule, setSelectedModule] = useState("Module 1");
  const modules = ["Module 1", "Module 2", "Module 3"];

  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseLevel, setCourseLevel] = useState("beginner");
  const [courseImageUrl, setCourseImageUrl] = useState("");
  const [coursePrice, setCoursePrice] = useState("0");
  const [courseDuration, setCourseDuration] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (editId) {
      const fetchCourse = async () => {
        try {
          const res = await api.get("/instructor/my-courses");
          const course = res.data.courses.find((c: any) => c._id === editId);
          if (course) {
            setCourseTitle(course.title || "");
            setCourseDescription(course.description || "");
            setCourseLevel(course.level || "beginner");
            setCourseImageUrl(course.image || "");
            setCoursePrice(String(course.price ?? 0));
            setCourseDuration(course.duration || "");
            setLessons(
              (course.materials || [])
                .filter((m: any) => m.type === "video")
                .map((m: any, i: number) => ({
                  id: i + 1,
                  title: m.title || "",
                  module: m.module || "Module 1",
                  videoUrl: m.url || "",
                  pdfUrl: "",
                }))
            );
          }
        } catch (err) {
          console.error("Error fetching course:", err);
        }
      };
      fetchCourse();
    }
  }, [editId]);

  const handleAddLesson = () => {
    setLessons([...lessons, { id: lessons.length + 1, title: "", module: selectedModule, videoUrl: "", pdfUrl: "" }]);
  };

  const handleLessonChange = (id: number, field: keyof Lesson, value: string) => {
    setLessons(lessons.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleDeleteLesson = (id: number) => {
    setLessons(lessons.filter((l) => l.id !== id));
  };

  const handleSaveCourse = async () => {
    if (!courseTitle || !courseDescription) {
      setSaveError("Please fill in course title and description.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: any = {
        title: courseTitle,
        description: courseDescription,
        level: courseLevel,
        image: courseImageUrl,
        price: Number(coursePrice) || 0,
        duration: courseDuration,
        materials: lessons.flatMap((l) => {
          const items: any[] = [];
          if (l.videoUrl) items.push({ type: "video", url: l.videoUrl, title: l.title });
          if (l.pdfUrl)   items.push({ type: "pdf",   url: l.pdfUrl,   title: l.title });
          return items;
        }),
      };

      if (editId) {
        await api.put(`/instructor/update-course/${editId}`, payload);
      } else {
        await api.post("/instructor/add-full-course", payload);
      }
      router.push("/courses-management");
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const filteredLessons = lessons.filter((l) => l.module === selectedModule);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFD9B8, #FFE6C5)" }}>
      <CourseBuilderNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* ✅ لما يضغط Final Quiz يروح لصفحة /final-quiz */}
        <CourseHeader
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === "quiz") {
              router.push(`/final-quiz${editId ? `?courseId=${editId}` : ""}`);
            } else {
              setActiveTab(tab);
            }
          }}
        />

        {/* ✅ Course Content Tab */}
        {activeTab === "content" && (
          <>
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Course Title *</label>
                <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Enter course title"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description *</label>
                <textarea value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Enter course description" rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Level</label>
                  <select value={courseLevel} onChange={(e) => setCourseLevel(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Image URL</label>
                  <input type="text" value={courseImageUrl} onChange={(e) => setCourseImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">💰 Price (EGP)</label>
                  <input type="number" min="0" value={coursePrice} onChange={(e) => setCoursePrice(e.target.value)}
                    placeholder="0 = Free"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <p className="text-xs text-gray-400 mt-1">0 = مجاني</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">⏱ Duration</label>
                  <input type="text" value={courseDuration} onChange={(e) => setCourseDuration(e.target.value)}
                    placeholder="e.g. 2 hours"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              
              </div>
            </div>

            <div className="mb-4">
              <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                {modules.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Modules / Lessons</h2>
              {filteredLessons.length === 0 && (
                <p className="text-gray-400 text-sm mb-4">No lessons yet. Press + to add one.</p>
              )}
              <div className="space-y-4">
                {filteredLessons.map((lesson, index) => (
                  <div key={lesson.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-bold text-lg">{String(index + 1).padStart(2, "0")}</span>
                      <button onClick={() => handleDeleteLesson(lesson.id)} className="text-red-400 hover:text-red-600 text-sm">🗑 Delete</button>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Lesson Title</label>
                      <input type="text" value={lesson.title} onChange={(e) => handleLessonChange(lesson.id, "title", e.target.value)}
                        placeholder="e.g. Introduction to JS"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">🎬 Video URL</label>
                      <input type="url" value={lesson.videoUrl} onChange={(e) => handleLessonChange(lesson.id, "videoUrl", e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">📄 PDF URL</label>
                      <input type="url" value={lesson.pdfUrl} onChange={(e) => handleLessonChange(lesson.id, "pdfUrl", e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleAddLesson}
                className="mt-4 w-12 h-12 rounded-full bg-gradient-to-r from-[#FF8A00] to-[#FFB84D] text-white text-2xl shadow-lg hover:scale-110 transition-transform flex items-center justify-center">
                +
              </button>
            </div>
          </>
        )}

        {saveError && <p className="text-red-500 text-sm mb-3">{saveError}</p>}

        <div className="flex justify-end pb-10">
          <button onClick={handleSaveCourse} disabled={saving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFB84D] text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? "Saving..." : editId ? "Update Course ✏️" : "Save Course 🚀"}
          </button>
        </div>
      </main>
      <CourseBuilderFooter />
    </div>
  );
}