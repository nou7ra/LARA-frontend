"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

interface Review {
  rating: number;
  comment: string;
  date: string;
}

interface InstructorCourseCardProps {
  id: string | number;
  title: string;
  imageUrl: string;
  level: string;
  price?: number;
  duration?: string;
  reviews?: Review[];
  delay?: number;
}

const InstructorCourseCard: React.FC<InstructorCourseCardProps> = ({
  id, title, imageUrl, level, price = 0, duration = "", reviews = [], delay = 0,
}) => {
  const [showReviews, setShowReviews] = useState(false);

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const getLevelStyles = () => {
    switch (level?.toLowerCase()) {
      case "advanced":     return "bg-gradient-to-r from-[#FF8A00] to-[#FFB84D] text-white";
      case "beginner":     return "bg-gradient-to-r from-[#FFD199] to-[#FFE6C5] text-orange-800";
      case "intermediate": return "bg-gradient-to-r from-[#FFA500] to-[#FFB84D] text-white";
      default:             return "bg-orange-100 text-orange-800";
    }
  };

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 group"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📚</div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>

        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3 capitalize ${getLevelStyles()}`}>
          {level}
        </span>

        {/* Price / Duration */}
        <div className="flex items-center justify-between text-sm mb-3 flex-wrap gap-1">
          <span className={`font-bold text-base ${price === 0 ? "text-green-600" : "text-orange-600"}`}>
            {price === 0 ? "FREE 🎉" : `${price} EGP`}
          </span>
          {duration && <span className="text-gray-500">⏱ {duration}</span>}
        </div>

        {/* ✅ Rating من التقييمات الحقيقية */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(star => (
              <FaStar key={star} className={`text-sm ${star <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}`} />
            ))}
            <span className="text-sm text-gray-600 ml-1">
              {avgRating > 0 ? `${avgRating} (${reviews.length})` : "No reviews yet"}
            </span>
          </div>
          {reviews.length > 0 && (
            <button
              onClick={() => setShowReviews(!showReviews)}
              className="text-xs text-orange-500 hover:underline font-medium"
            >
              {showReviews ? "Hide" : "View"}
            </button>
          )}
        </div>

        {/* ✅ Reviews List */}
        {showReviews && reviews.length > 0 && (
          <div className="mb-3 max-h-36 overflow-y-auto space-y-2 border border-orange-100 rounded-xl p-3 bg-orange-50">
            {reviews.map((review, i) => (
              <div key={i} className="text-sm border-b border-orange-100 pb-2 last:border-0">
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map(s => (
                    <FaStar key={s} className={`text-xs ${s <= review.rating ? "text-yellow-400" : "text-gray-300"}`} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    {review.date ? new Date(review.date).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        <Link
          href={`/course-builder?edit=${id}`}
          className="block w-full text-center py-3 bg-gradient-to-r from-[#FF8A00] to-[#FFB84D] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
        >
          Course Presentation
        </Link>
      </div>
    </div>
  );
};

export default InstructorCourseCard;