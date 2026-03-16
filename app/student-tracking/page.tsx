"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  StudentTrackingNavbar,
  StudentFilters,
  StudentCard,
  StudentTrackingFooter,
} from "@/components/student-tracking";
import api from "@/services/api";

interface Student {
  _id: string;
  name: string;
  course: string;
  progress: number;
  lastActivity: string;
}

export default function StudentTracking() {
  const [students, setStudents]       = useState<Student[]>([]);
  const [coursesList, setCoursesList] = useState<string[]>([]);
  const [searchTerm, setSearchTerm]   = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
  const fetchData = async () => {
    try {
      // ✅ جيب الكورسات
      const coursesRes = await api.get("/instructor/my-courses");
      const courseData = coursesRes.data.courses || coursesRes.data || [];
      const names: string[] = Array.isArray(courseData)
        ? courseData.map((c: any) => c.title || c.name).filter(Boolean)
        : [];
      setCoursesList(names);
    } catch (err) {
      console.error("Courses error:", err);
    }

    try {
      // ✅ جيب الطلاب
      const studentsRes = await api.get("/instructor/my-students");
      const data: Student[] = (studentsRes.data.students || []).map((s: any) => ({
        _id:          s._id,
        name:         s.name         || "Unknown",
        course:       s.courseName   || "—",
        progress:     s.progress     || 0,
        lastActivity: s.lastActivity || "—",
      }));
      setStudents(data);
    } catch (err) {
      console.error("Students error:", err);
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = !selectedCourse || student.course === selectedCourse;
      return matchesSearch && matchesCourse;
    });
  }, [students, searchTerm, selectedCourse]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFD9B8, #FFE6C5)" }}>
      <StudentTrackingNavbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8 animate-fadeIn">
          Student Tracking
        </h1>

        <StudentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCourse={selectedCourse}
          onCourseChange={setSelectedCourse}
          courses={coursesList}
        />

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-orange-500 font-semibold animate-pulse">
            Loading students...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16 text-red-500 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Students Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => (
              <StudentCard
                key={student._id}
                id={student._id}
                name={student.name}
                course={student.course}
                progress={student.progress}
                lastActivity={student.lastActivity}
                delay={0.1 * index}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredStudents.length === 0 && (
          <div className="text-center py-16 animate-fadeIn">
            <p className="text-gray-600 text-lg">No students found.</p>
          </div>
        )}
      </main>

      <StudentTrackingFooter />
    </div>
  );
}