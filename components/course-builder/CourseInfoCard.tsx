"use client";

import React from "react";
import Image from "next/image";

interface CourseInfoCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

const CourseInfoCard: React.FC<CourseInfoCardProps> = ({ title, description, imageUrl }) => {
  return (
    <div className="mb-6 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Course Title</h2>
      <div className="bg-white rounded-xl p-4 mb-6 shadow-md">
        <input
          type="text"
          value={title}
          className="w-full p-3 text-lg border-none outline-none bg-transparent"
          placeholder="Enter course title"
        />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">Description</h2>
      <div className="bg-white rounded-xl p-6 shadow-md flex gap-6 hover:shadow-lg transition-shadow duration-300">
        <div className="flex-1">
          <p className="text-gray-800 leading-relaxed">{description}</p>
        </div>
        <div className="relative w-64 h-40 flex-shrink-0 rounded-lg overflow-hidden group">
          <Image
            src={imageUrl || "/images/my-courses/Rectangle%204403.png"}
            alt="Course preview"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-[#00D9A5] text-white px-3 py-1 rounded-lg font-bold text-sm">
            $936
          </div>
          <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-semibold">
            9 أيام بس
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInfoCard;
