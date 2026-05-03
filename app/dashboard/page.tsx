'use client';

import React, { useState, useEffect } from 'react';
import {
  DashboardNavbar,
  StatsCard,
  CalendarCard,
  ScheduleItem,
  BarChartCard,
  PieChartCard,
  ScatterChartCard,
  DropoutChartCard,
} from '@/components/dashboard';
import { correlationData } from '@/data/analytics';
import api from '@/services/api';

interface Session {
  id: string;
  day: string;
  weekday: string;
  title: string;
  timeStart: string;
  timeEnd: string;
  courseTitle: string;
}

export default function Dashboard() {
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalEnrollment, setTotalEnrollment] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [topCoursesData, setTopCoursesData] = useState<{ course: string; rate: number }[]>([]);
  const [bottomCoursesData, setBottomCoursesData] = useState<{ course: string; rate: number }[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [dropoutData, setDropoutData] = useState([
    { duration: "Short", rate: 15 },
    { duration: "Medium", rate: 28 },
    { duration: "Long", rate: 42 },
  ]);
  const [repeatCoursesData, setRepeatCoursesData] = useState([
    { name: "No Repeats", value: 65, color: "#FFD199" },
    { name: "Repeated", value: 35, color: "#FF8A00" },
  ]);
  const [loading, setLoading] = useState(true);

  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const times = ["9:00 AM", "11:00 AM", "1:30 PM", "3:00 PM", "5:00 PM"];

  const today = new Date();
  const currentMonth = today.toLocaleString('en-US', { month: 'long' });
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();

  const dynamicCalendar = {
    month: currentMonth,
    year: currentYear,
    selectedDate: currentDay,
    days: Array.from({ length: daysInMonth }, (_, i) => {
      const date = i + 1;
      const weekday = new Date(currentYear, today.getMonth(), date).getDay();
      return { date, weekday: weekdayNames[weekday] };
    }),
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/instructor/my-courses');
        const courses = res.data.courses || res.data.data?.courses || res.data.data || res.data || [];
        const courseList = Array.isArray(courses) ? courses : [];

        // ✅ Total Courses
        setTotalCourses(courseList.length);

        // ✅ Total Students = كل الطلاب على المنصة
        try {
          const studentsRes = await api.get('/instructor/my-students');
          setTotalStudents((studentsRes.data.students || []).length);
        } catch {
          setTotalStudents(0);
        }

        // ✅ Total Enrollment = بيجيب القديم والجديد مع بعض
        try {
          const statsRes = await api.get('/instructor/dashboard-stats');
          setTotalEnrollment(statsRes.data.totalEnrollment || 0);
        } catch {
          let enrollCount = 0;
          courseList.forEach((c: any) => {
            enrollCount += (c.enrolledStudents || []).length;
          });
          setTotalEnrollment(enrollCount);
        }

        // ✅ Success rate لكل كورس
        const coursesWithRate = courseList.map((c: any) => {
          const enrolled = c.enrolledStudents?.length || c.studentsCount || 1;
          const completed = (c.enrolledStudents || []).filter(
  (e: any) => e.progress === 100
).length;
          const rate = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
          return {
            course: (c.title || 'Course').replace(/\s+/g, '_').substring(0, 15),
            rate,
          };
        });

        const sorted = [...coursesWithRate].sort((a, b) => b.rate - a.rate);
        setTopCoursesData(sorted.slice(0, 5));
        setBottomCoursesData([...sorted].reverse().slice(0, 5));

        // ✅ Fallback sessions
        const fakeSessions = courseList.slice(0, 5).map((c: any, i: number) => {
          const sessionDate = new Date(today);
          sessionDate.setDate(today.getDate() + i);
          return {
            id: c._id,
            day: String(sessionDate.getDate()),
            weekday: weekdays[sessionDate.getDay()],
            title: c.title || "Course Session",
            timeStart: times[i % times.length],
            timeEnd: times[(i + 1) % times.length],
            courseTitle: "",
          };
        });

        // ✅ Sessions الحقيقية
        try {
          const sessionRes = await api.get('/api/sessions/upcoming');
          const todayMidnight = new Date();
          todayMidnight.setHours(0, 0, 0, 0);

          const realSessions = (sessionRes.data.sessions || [])
            .filter((s: any) => {
              const [y, m, d] = s.date.split("T")[0].split("-").map(Number);
              return new Date(y, m - 1, d) >= todayMidnight;
            })
            .sort((a: any, b: any) => {
              const [ay, am, ad] = a.date.split("T")[0].split("-").map(Number);
              const [by, bm, bd] = b.date.split("T")[0].split("-").map(Number);
              return new Date(ay, am - 1, ad).getTime() - new Date(by, bm - 1, bd).getTime();
            })
            .slice(0, 5)
            .map((s: any) => {
              const [y, m, d] = s.date.split("T")[0].split("-").map(Number);
              const dateObj = new Date(y, m - 1, d);
              return {
                id: s._id,
                day: String(dateObj.getDate()),
                weekday: weekdays[dateObj.getDay()],
                title: s.title,
                timeStart: s.timeStart,
                timeEnd: s.timeEnd,
                courseTitle: s.courseTitle || "",
              };
            });

          setSessions(realSessions.length > 0 ? realSessions : fakeSessions);
        } catch {
          setSessions(fakeSessions);
        }

        // ✅ Analytics
        try {
          const analyticsRes = await api.get('/instructor/analytics');
          if (analyticsRes.data.dropoutData) setDropoutData(analyticsRes.data.dropoutData);
          if (analyticsRes.data.repeatData) setRepeatCoursesData(analyticsRes.data.repeatData);
        } catch {
          // هتفضل الـ default values
        }

      } catch (err: any) {
        console.error('❌ Dashboard fetch error:', err?.response?.status, err?.response?.data || err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsData = [
    {
      id: 1,
      title: "Total Students",
      value: loading ? "..." : totalStudents.toLocaleString(),
      icon: "graduation-cap",
      bgColor: "#FF8A00",
      textColor: "text-white",
    },
    {
      id: 2,
      title: "Total Courses",
      value: loading ? "..." : totalCourses.toString(),
      icon: "play",
      bgColor: "#FFD199",
      textColor: "text-gray-900",
    },
    {
      id: 3,
      title: "Total Enrollment",
      value: loading ? "..." : totalEnrollment.toLocaleString(),
      icon: "file-text",
      bgColor: "#FF6B6B",
      textColor: "text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF7E6]">
      <DashboardNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsData.map((stat) => (
              <StatsCard
                key={stat.id}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                bgColor={stat.bgColor}
                textColor={stat.textColor}
              />
            ))}
          </div>
        </section>

        {/* Calendar & Sessions */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CalendarCard
                month={dynamicCalendar.month}
                year={dynamicCalendar.year}
                selectedDate={dynamicCalendar.selectedDate}
                days={dynamicCalendar.days}
              />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
              {loading ? (
                <div className="text-gray-400 animate-pulse">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="text-gray-400 text-center py-8">No upcoming sessions.</div>
              ) : (
                sessions.map((session) => (
                  <ScheduleItem
                    key={session.id}
                    day={session.day}
                    weekday={session.weekday}
                    title={session.title}
                    timeStart={session.timeStart}
                    timeEnd={session.timeEnd}
                    courseTitle={session.courseTitle}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Top & Bottom Courses */}
        <section className="mb-8">
          {loading ? (
            <div className="text-center text-gray-400 py-8 text-lg animate-pulse">Loading analytics...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BarChartCard
                title="Top 5 Courses by Success Rate"
                data={topCoursesData.length > 0 ? topCoursesData : [{ course: "No Data", rate: 0 }]}
                barColor="#FF8A00"
              />
              <BarChartCard
                title="Bottom 5 Courses by Success Rate"
                data={bottomCoursesData.length > 0 ? bottomCoursesData : [{ course: "No Data", rate: 0 }]}
                barColor="#FFD199"
              />
            </div>
          )}
        </section>

        {/* Dropout & Repeat */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DropoutChartCard
              title="Dropout Rate by Course Duration"
              data={dropoutData}
            />
            <PieChartCard
              title="Percentage of Students Who Repeated Courses"
              data={repeatCoursesData}
            />
          </div>
        </section>

        {/* Scatter Plot */}
        <section className="mb-8">
          <ScatterChartCard
            title="Correlation Between Pre-Course and Final Exam"
            data={correlationData}
            correlationCoefficient={0.02}
          />
        </section>

      </main>
    </div>
  );
}