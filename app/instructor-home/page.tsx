"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import api from "@/services/api";
import {
  InstructorHomeNavbar,
  HeroSection,
  InstructorCourseCard,
  RecentActivity,
  StudentFeedback,
  InstructorHomeFooter,
} from "@/components/instructor-home";
import {
  recentActivitiesData,
  testimonialData,
} from "@/data/instructorHome";

export default function InstructorHome() {
  const [activityFilter, setActivityFilter] = useState("today");
  const [instructorName, setInstructorName] = useState("Instructor");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.name) setInstructorName(user.name);
    }
  }, []);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await api.get("/instructor/my-courses");
        setCourses(response.data.courses || []);
      } catch (error: any) {
        console.error("Error fetching courses:", error?.response?.status, error?.response?.data || error?.message);
        setCoursesError(`Failed to load courses: ${error?.response?.status || error?.message}`);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchMyCourses();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFD9B8, #FFF7E6)" }}>
      <InstructorHomeNavbar />

      <HeroSection userName={instructorName} />

      <section className="py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 animate-fadeIn">
            My Courses
          </h2>

          {loadingCourses && (
            <div className="text-center text-gray-500 py-10 animate-pulse">
              Loading courses...
            </div>
          )}

          {coursesError && (
            <div className="text-center text-red-500 py-10">
              {coursesError}
            </div>
          )}

          {!loadingCourses && !coursesError && courses.length === 0 && (
            <div className="text-center text-gray-400 py-10">
              No courses yet. Start by adding your first course!
            </div>
          )}

          {!loadingCourses && courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <InstructorCourseCard
                  key={course._id}
                  id={course._id}
                  title={course.title}
                  imageUrl={course.image || "/images/default-course.jpg"}
                  level={course.level}
                  reviews={course.reviews || []} 
                  delay={0.1 * index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <RecentActivity
        activities={recentActivitiesData}
        filter={activityFilter}
        onFilterChange={setActivityFilter}
      />

      <StudentFeedback testimonials={testimonialData} />

      <Link href="/chatbot" className="fixed right-10 bottom-10 z-30 group">
        <Image
          src="/images/my-courses/unsplash_d42U7dK0M9w.png"
          alt="Go to ChatBot"
          width={70}
          height={70}
          className="cursor-pointer hover:scale-110 transition-transform hover:shadow-2xl rounded-full shadow-lg animate-bounce"
        />
      </Link>

      <InstructorHomeFooter />
    </div>
  );
}