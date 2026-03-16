"use client";

import React from "react";

interface StudentCardProps {
  id: string | number;
  name: string;
  course: string;
  progress: number;
  lastActivity: string;
  delay?: number;
}

const StudentCard: React.FC<StudentCardProps> = ({
  id,
  name,
  course,
  progress,
  lastActivity,
  delay = 0,
}) => {
  const getProgressColor = () => {
    if (progress > 70) return "#22c55e";      // أخضر
    if (progress >= 40) return "#eab308";     // أصفر
    return "#ef4444";                          // أحمر
  };

  const getProgressTextColor = () => {
    if (progress > 70) return "text-green-500";
    if (progress >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getBorderColor = () => {
    if (progress > 70) return "border-green-500";
    if (progress >= 40) return "border-yellow-500";
    return "border-red-500";
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slideUp border-l-4 ${getBorderColor()}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{name}</h3>
        <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
          {course}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: getProgressColor(),
            }}
          />
        </div>
      </div>

      {/* Progress % */}
      <p className="text-gray-800 font-semibold mb-2">
        Progress:{" "}
        <span className={`font-bold ${getProgressTextColor()}`}>{progress}%</span>
      </p>

      {/* Last Activity */}
      <p className="text-gray-600 text-sm">
        Last Activity: <span className="font-medium">{lastActivity}</span>
      </p>
    </div>
  );
};

export default StudentCard;