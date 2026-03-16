"use client";

import React, { useState, useEffect } from "react";
import {
  AdminNavbar,
  AdminStatsCard,
  DistributionChart,
  PendingApprovals,
  DropoutRateChart,
  DropoutComparisonChart,
  RepeatedCoursesChart,
  LatestActivityTable,
} from "@/components/admin-dashboard";
import api from "@/services/api";

export default function AdminDashboardPage() {
  const [adminName, setAdminName] = useState("Admin");
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0 });
  const [distributionData, setDistributionData] = useState<{ data: any[]; average: number }>({ data: [], average: 0 });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [dropoutByLevel, setDropoutByLevel] = useState([]);
  const [dropoutComparison, setDropoutComparison] = useState([]);
  const [repeatedCourses, setRepeatedCourses] = useState([]);
  const [latestActivity, setLatestActivity] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.name) setAdminName(user.name);
    }

    const fetchAll = async () => {
      try {
        const [
          statsRes,
          distributionRes,
          pendingRes,
          dropoutLevelRes,
          dropoutCompRes,
          repeatedRes,
          activityRes,
        ] = await Promise.all([
          api.get("/admin/dashboard-stats"),
          api.get("/admin/charts/distribution"),
          api.get("/admin/charts/pending-approvals"),
          api.get("/admin/charts/dropout-by-level"),
          api.get("/admin/charts/dropout-comparison"),
          api.get("/admin/charts/repeated-courses"),
          api.get("/admin/charts/latest-activity"),
        ]);

        setStats(statsRes.data);
        setDistributionData(distributionRes.data || { data: [], average: 0 });
        setPendingApprovals(pendingRes.data || []);
        setDropoutByLevel(dropoutLevelRes.data || []);
        setDropoutComparison(dropoutCompRes.data || []);
        setRepeatedCourses(repeatedRes.data || []);
        setLatestActivity(activityRes.data || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar activeTab="dashboard" />

      <main className="px-8 py-6 max-w-7xl mx-auto">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {adminName}! 👋</h1>
          <p className="text-gray-500">Here&apos;s what&apos;s happening with your platform today.</p>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <AdminStatsCard type="students" value={stats.totalStudents} delay={0}   />
          <AdminStatsCard type="courses"  value={stats.totalCourses}  delay={0.2} />
          <AdminStatsCard type="revenue"  value={0}                   delay={0.3} />
        </div>

        {/* Distribution + Pending Approvals */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-3">
            <DistributionChart
              data={distributionData.data}
              average={distributionData.average}
            />
          </div>
          <div className="lg:col-span-2">
            <PendingApprovals approvals={pendingApprovals} />
          </div>
        </div>

        {/* Dropout Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DropoutRateChart data={dropoutByLevel} />
          <DropoutComparisonChart data={dropoutComparison} />
        </div>

        {/* Repeated Courses + Latest Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RepeatedCoursesChart data={repeatedCourses} />
          </div>
          <div className="lg:col-span-2">
            <LatestActivityTable activities={latestActivity} />
          </div>
        </div>
      </main>
    </div>
  );
}