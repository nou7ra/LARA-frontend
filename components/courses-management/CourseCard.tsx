"use client";

import React, { useState } from "react";
import { FaUser, FaBook, FaStar } from "react-icons/fa";

interface Review {
  rating: number;
  comment: string;
  date: string;
}

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  students: number;
  lessons: number;
  status: "Active" | "Draft";
  price?: number;
  duration?: string;
  reviews?: Review[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  delay?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id, title, imageUrl, students, lessons, status,
  price = 0, duration = "", reviews = [],
  onEdit, onDelete, delay = 0,
}) => {
  const [showReviews, setShowReviews] = useState(false);

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slideUp group"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-orange-100">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📚</div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-3 truncate">{title}</h3>

        {/* Students & Lessons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-gray-600">
            <FaUser className="text-sm" />
            <span className="text-sm">{students} Student</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <FaBook className="text-sm" />
            <span className="text-sm">{lessons} lesson</span>
          </div>
        </div>

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
              {showReviews ? "Hide" : "View"} reviews
            </button>
          )}
        </div>

        {/* ✅ Reviews List */}
        {showReviews && reviews.length > 0 && (
          <div className="mb-3 max-h-40 overflow-y-auto space-y-2 border border-orange-100 rounded-xl p-3 bg-orange-50">
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

        {/* Status */}
        <div className="mb-4">
          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#FF8A00] to-[#FFB84D] text-white">
            {status}
          </span>
        </div>

        {/* Edit & Delete */}
        <div className="flex items-center gap-3">
          <button onClick={() => onEdit(id)}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all">
            Edit
          </button>
          <button onClick={() => onDelete(id)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FF4D4D] to-[#FF6B6B] text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;