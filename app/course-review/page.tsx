"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/services/api";

function CourseReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [courseTitle, setCourseTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!courseId) return;
    api.get("/students/courses")
      .then(res => {
        const courses = res.data.courses || [];
        const course = courses.find((c: any) => c._id === courseId);
        if (course) setCourseTitle(course.title);
      })
      .catch(() => {});
  }, [courseId]);

  const handleSubmit = async () => {
    setError("");
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!comment.trim()) { setError("Please write a review"); return; }
    setLoading(true);
    try {
      await api.post("/students/review", { courseId, rating, comment });
      setSuccess(true);
      setTimeout(() => router.push("/student-dashboard"), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong, try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7E6] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-lg">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-[#FF8A00] hover:text-[#FF7700] font-bold text-xl">←</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Course</h1>
            {courseTitle && <p className="text-sm text-gray-500 mt-1">📚 {courseTitle}</p>}
          </div>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 mb-6 text-center font-medium">
            ✅ Review submitted! Redirecting...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6 text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-transform hover:scale-110">
                  <span className={star <= (hoveredRating || rating) ? "text-[#FF8A00]" : "text-gray-300"}>★</span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-[#FF8A00] mt-2 font-medium">
                {rating === 1 && "Poor"}{rating === 2 && "Fair"}{rating === 3 && "Good"}
                {rating === 4 && "Very Good"}{rating === 5 && "Excellent!"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this course..." rows={5}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#FF8A00] transition-colors resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={loading || success}
            className="w-full bg-[#FF8A00] text-white font-bold py-4 rounded-full hover:bg-[#FF7700] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CourseReviewContent />
    </Suspense>
  );
}