"use client";

import React from "react";
import { FaChevronDown } from "react-icons/fa";
import ActivityItem from "./ActivityItem";

interface Activity {
  id?: number;
  text?: string;
  message?: string;
  type: "completed" | "submitted" | "finished" | "enroll" | "complete" | "review";
  date?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  filter: string;
  onFilterChange: (value: string) => void;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities, filter, onFilterChange }) => {

  // ✅ فلترة الـ activities حسب الـ filter المختار
  const filteredActivities = activities.filter((activity) => {
    if (!activity.date) return true;

    const activityDate = new Date(activity.date);
    const now = new Date();

    if (filter === "today") {
      return (
        activityDate.getFullYear() === now.getFullYear() &&
        activityDate.getMonth() === now.getMonth() &&
        activityDate.getDate() === now.getDate()
      );
    }

    if (filter === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return activityDate >= startOfWeek;
    }

    if (filter === "month") {
      return (
        activityDate.getFullYear() === now.getFullYear() &&
        activityDate.getMonth() === now.getMonth()
      );
    }

    return true;
  });

  return (
    <section className="py-12 px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 animate-fadeIn">Recent Activity</h2>
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-5 py-2 rounded-full border-2 border-gray-300 bg-white text-gray-700 font-medium focus:border-orange-400 focus:outline-none appearance-none cursor-pointer pr-10 hover:border-gray-400 transition-colors"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4">
          {filteredActivities.length === 0 && (
            <p className="text-center text-gray-400 py-6">No activity in this period.</p>
          )}
          {filteredActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id ?? index}
              id={activity.id ?? index}
              text={activity.text ?? activity.message ?? ""}
              type={activity.type}
              delay={0.1 * index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentActivity;