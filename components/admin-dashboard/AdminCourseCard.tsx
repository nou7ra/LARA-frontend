"use client";

import React from "react";
import { FaStar, FaCheck, FaTimes } from "react-icons/fa";

interface Course {
  id: number;
  name: string;
  instructor: string;
  students: number;
  rating: number;
  status: "pending" | "approved" | "rejected";
}

interface AdminCourseCardProps {
  course: Course;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  delay?: number;
}

const AdminCourseCard: React.FC<AdminCourseCardProps> = ({
  course,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  delay = 0,
}) => {
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slideUp"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Course Name */}
      <h3 className="text-lg font-bold text-gray-900 mb-3">{course.name}</h3>

      {/* Course Info */}
      <div className="space-y-1 mb-4">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Instructor:</span>{course.instructor}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Students:</span> {course.students}
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-700">Rating:</span>
        <span className="text-sm font-semibold text-gray-800">{course.rating}</span>
        <FaStar className="text-yellow-500 text-sm" />
      </div>

      {/* Approve/Reject Buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => onApprove(course.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
            course.status === "approved"
              ? "bg-green-500 text-white"
              : "bg-white border-2 border-green-500 text-green-600 hover:bg-green-50"
          }`}
        >
          <FaCheck className="text-xs" />
          Approve
        </button>
        <button
          onClick={() => onReject(course.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
            course.status === "rejected"
              ? "bg-red-500 text-white"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          <FaTimes className="text-xs" />
          Reject
        </button>
      </div>

      {/* ✅ Delete Button Only */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDelete(course.id)}
          className="px-5 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AdminCourseCard;