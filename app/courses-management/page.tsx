"use client";

import React, { useState, useMemo, useEffect } from "react";
import api from "@/services/api";
import {
  CoursesManagementNavbar,
  AddCourseButton,
  CourseFilters,
  CourseCard,
  CoursesManagementFooter,
} from "@/components/courses-management";
import { courseCategories, courseStatuses } from "@/data/coursesManagement";

// ✅ image مش imageUrl — ده اسمه في الباك
interface Course {
  _id: string;
  title: string;
  image?: string;
  level?: string;
  category?: string;
  status?: "Active" | "Draft";
  reviews?: Review[]; 
  students?: number;
  materials?: any[];
}

export default function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get("/instructor/my-courses");
        setCourses(response.data.courses || []);
      } catch (err) {
        setError("Failed to load courses. Please try again.");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || course.category === selectedCategory;
      const matchesStatus = !selectedStatus || course.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, searchTerm, selectedCategory, selectedStatus]);

  const handleAddCourse = () => { window.location.href = "/course-builder"; };
  const handleEditCourse = (id: string) => { window.location.href = `/course-builder?edit=${id}`; };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.delete(`/instructor/course/${id}`);
      setCourses(courses.filter((course) => course._id !== id));
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course. Please try again.");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFD9B8, #FFE6C5)" }}>
      <CoursesManagementNavbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-end mb-6">
          <AddCourseButton onClick={handleAddCourse} />
        </div>

        <CourseFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          categories={courseCategories}
          statuses={courseStatuses}
        />

        {loading && <div className="text-center py-16 text-gray-500">Loading courses...</div>}
        {error && <div className="text-center py-16 text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course._id}
                id={course._id}
                title={course.title}
                imageUrl={course.image || ""}
                students={course.students || 0}
                lessons={course.materials?.length || 0}
                status={course.status || "Active"}
                reviews={course.reviews || []}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
                delay={0.1 * index}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No courses found.</p>
            <button onClick={handleAddCourse}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
              Add your first course
            </button>
          </div>
        )}
      </main>

      <CoursesManagementFooter />
    </div>
  );
}
