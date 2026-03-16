'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface Course {
  _id: string;
  title: string;
}

export default function AddSessionPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    courseId:    "",
    title:       "",
    date:        "",
    timeStart:   "",
    timeEnd:     "",
    meetingLink: "",
    price:       "",
  });

  useEffect(() => {
    api.get('/instructor/my-courses')
      .then(res => {
        const list = res.data.courses || res.data.data || res.data || [];
        setCourses(Array.isArray(list) ? list : []);
      })
      .catch(() => setCourses([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.courseId || !form.title || !form.date || !form.timeStart || !form.timeEnd) {
      setError("كل الحقول مطلوبة ما عدا Meeting Link");
      return;
    }

    setLoading(true);
    try {
      await api.post('/instructor/add-session', {
        courseId:    form.courseId,
        title:       form.title,
        date:        form.date,
        timeStart:   formatTime(form.timeStart),
        timeEnd:     formatTime(form.timeEnd),
        meetingLink: form.meetingLink,
        price:       form.price ? Number(form.price) : 0,
      });

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || "حصل خطأ، حاول تاني");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7E6] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="text-[#FF8A00] hover:text-[#FF7700] font-bold text-xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Session</h1>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl p-4 mb-6 text-center font-medium">
            ✅ Session added! Redirecting...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 mb-6 text-center font-medium">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col gap-5">

          {/* Course */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Course
            </label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#FF8A00] transition-colors"
            >
              <option value="">Select a course...</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Session Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Introduction to React"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#FF8A00] transition-colors"
            />
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meeting Link
            </label>
            <input
              type="url"
              name="meetingLink"
              value={form.meetingLink}
              onChange={handleChange}
              placeholder="e.g. https://zoom.us/j/123456789"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#FF8A00] transition-colors"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#FF8A00] transition-colors"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="timeStart"
                value={form.timeStart}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#FF8A00] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="timeEnd"
                value={form.timeEnd}
                onChange={handleChange}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#FF8A00] transition-colors"
              />
            </div>
          </div>

          {/* ✅ Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price (EGP)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 199"
              min="0"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#FF8A00] transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="w-full bg-[#FF8A00] text-white font-bold py-4 rounded-full hover:bg-[#FF7700] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Saving..." : "Add Session"}
          </button>

        </div>
      </div>
    </div>
  );
}