"use client";

import React from "react";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

interface TestimonialCardProps {
  id: number;
  name: string;
  course: string;
  feedback: string;
  avatarUrl: string;
  delay?: number;
  rating?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  id,
  name,
  course,
  feedback,
  avatarUrl,
  delay = 0,
  rating = 5,
}) => {
  const initials = name?.charAt(0)?.toUpperCase() || "?";

  // ✅ تشيك إن الصورة URL صحيحة
  const hasValidAvatar = avatarUrl && avatarUrl.startsWith("http");

  return (
    <div
      className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slideUp flex-shrink-0 border border-orange-100 flex flex-col justify-between"
      style={{
        animationDelay: `${delay}s`,
        width: "320px",
        minHeight: "220px",
      }}
    >
      {/* Quote Icon - corner */}
      <div className="absolute top-4 right-5 text-orange-100 text-4xl leading-none select-none">
        <FaQuoteLeft />
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? "text-orange-400" : "text-gray-200"}
            size={15}
          />
        ))}
      </div>

      {/* Feedback */}
      <p className="text-gray-600 leading-relaxed text-sm flex-1 mb-5 line-clamp-4">
        "{feedback}"
      </p>

      {/* Divider */}
      <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
        {/* Avatar */}
        {hasValidAvatar ? (
          <img
            src={avatarUrl}
            alt={name}
            width={44}
            height={44}
            className="rounded-full object-cover border-2 border-orange-200"
            style={{ width: 44, height: 44 }}
            onError={(e) => {
              // ✅ لو الصورة كسرت، خبيها واعرض الـ initials
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg border-2 border-orange-200 flex-shrink-0">
            {initials}
          </div>
        )}
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
          <p className="text-xs text-orange-500 font-medium">📚 {course}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;