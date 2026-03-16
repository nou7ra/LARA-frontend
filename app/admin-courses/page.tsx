"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AdminNavbar,
  AdminCourseFilters,
  AdminCourseCard,
  Pagination,
} from "@/components/admin-dashboard";
import api from "@/services/api";

interface AdminCourse {
  _id: string;
  title?: string;
  name?: string;
  instructor?: { name: string; email: string } | string;
  status?: string;
  image?: string;
  level?: string;
  materials?: any[];
  reviews?: any[];
  enrolledStudents?: any[];
}

const COURSES_PER_PAGE = 9;

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api.get("/admin/courses")
      .then(res => setCourses(res.data || []))
      .catch(err => console.error("Courses error:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const courseName = course.title || course.name || "";
      const instructorName = typeof course.instructor === "object"
        ? course.instructor?.name || ""
        : course.instructor || "";
      const matchesSearch =
        courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructorName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredCourses.length / COURSES_PER_PAGE);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * COURSES_PER_PAGE;
    return filteredCourses.slice(start, start + COURSES_PER_PAGE);
  }, [filteredCourses, currentPage]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/admin/course/${id}`);
      setCourses(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleApprove = (id: string) => {
    setCourses(prev => prev.map(c => c._id === id ? { ...c, status: "approved" } : c));
  };

  const handleReject = (id: string) => {
    setCourses(prev => prev.map(c => c._id === id ? { ...c, status: "rejected" } : c));
  };

  const avgRating = (reviews: any[] = []) => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFD4A8, #FFECD9)" }}>
      <AdminNavbar activeTab="course-management" />

      <main className="px-8 py-6 max-w-7xl mx-auto">
        <AdminCourseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {loading && <div className="text-center py-16 text-gray-500">Loading courses...</div>}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCourses.map((course, index) => (
              <AdminCourseCard
                key={course._id}
                course={{
                  id: course._id,
                  name: course.title || course.name || "—",
                  instructor: typeof course.instructor === "object"
                    ? course.instructor?.name || "—"
                    : course.instructor || "—",
                  status: (course.status as any) || "active",
                  image: course.image || "",
                  students: course.enrolledStudents?.length || 0,
                  rating: avgRating(course.reviews),
                  lessons: course.materials?.length || 0,
                }}
                onApprove={() => handleApprove(course._id)}
                onReject={() => handleReject(course._id)}
                onEdit={() => {}}
                onDelete={() => handleDelete(course._id)}
                delay={0.05 * index}
              />
            ))}
          </div>
        )}

        {!loading && paginatedCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No courses found.</p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </main>
    </div>
  );
}