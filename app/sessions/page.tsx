"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/services/api";

interface Session {
  _id: string;
  title: string;
  courseTitle: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  price?: number;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/students/sessions")
      .then(res => setSessions(res.data.sessions || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = filtered.filter(s => {
    const d = formatDate(s.date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d >= today;
  });

  const past = filtered.filter(s => {
    const d = formatDate(s.date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d < today;
  });

  const SessionCard = ({ s }: { s: Session }) => {
    const dateObj = formatDate(s.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString("en-US", { month: "short" });
    const weekday = dateObj.toLocaleDateString("en-US", { weekday: "long" });
    const fullDate = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));

    return (
      <div className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border ${isPast ? "border-gray-100 opacity-70" : "border-orange-100"}`}>
        <div className={`h-1.5 w-full ${isPast ? "bg-gray-300" : "bg-gradient-to-r from-orange-400 to-amber-400"}`} />

        <div className="p-5 flex gap-4">
          <div className={`flex-shrink-0 rounded-2xl w-16 h-16 flex flex-col items-center justify-center shadow-inner ${isPast ? "bg-gray-100 text-gray-400" : "bg-gradient-to-b from-orange-500 to-orange-600 text-white"}`}>
            <span className="text-2xl font-black leading-none">{day}</span>
            <span className="text-[11px] uppercase font-bold tracking-wide">{month}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-gray-800 truncate">{s.title}</h3>
              {isPast && (
                <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">Ended</span>
              )}
            </div>
            <p className="text-sm text-orange-500 font-medium mt-0.5 truncate">{s.courseTitle}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[11px] bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-semibold">📅 {weekday}</span>
              <span className="text-[11px] bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full font-semibold">🕐 {s.timeStart} – {s.timeEnd}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{fullDate}</p>
            {s.price !== undefined && (
              <p className="text-xs font-bold mt-1 text-green-600">
                {s.price === 0 ? "Free 🎉" : `${s.price} EGP`}
              </p>
            )}
          </div>
        </div>

        {!isPast && (
          <div className="px-5 pb-4">
            <Link href={`/payment?courseId=${s._id}&price=${s.price || 0}`}
              className="block w-full text-center bg-gradient-to-r from-orange-500 to-amber-400 text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md">
              Book Now →
            </Link>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #fff6e8, #fff)" }}>

      <header className="h-[70px] sticky top-0 z-20 flex items-center justify-between px-9 shadow-sm"
        style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="flex items-center gap-4">
          <Link href="/my-courses">
            <Image src="/images/my-courses/logo.png" alt="LARA" width={55} height={55} />
          </Link>
        </div>
        <nav className="hidden md:flex gap-5 text-sm">
          <Link href="/my-courses" className="text-gray-800 hover:font-semibold">Home</Link>
          <Link href="/student-dashboard" className="text-gray-800 hover:font-semibold">Dashboard</Link>
          <Link href="/course-player" className="text-gray-800 hover:font-semibold">Course Player</Link>
          <Link href="/quiz" className="text-gray-800 hover:font-semibold">Quiz</Link>
          <Link href="/sessions" className="text-gray-800 font-semibold border-b-2 border-gray-800">Sessions</Link>
          <Link href="/about" className="text-gray-800 hover:font-semibold">About</Link>
        </nav>
        <Link href="/my-courses" className="text-sm text-gray-700 hover:font-semibold">← Back</Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2">📅 All Sessions</h1>
          <p className="text-gray-500 text-sm">Browse and book upcoming live sessions</p>
        </div>

        <div className="flex justify-center mb-10">
          <input type="text" placeholder="🔍 Search by session or course name..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-lg px-5 py-3 rounded-2xl border border-orange-200 outline-none focus:ring-2 focus:ring-orange-300 bg-white shadow-sm text-sm" />
        </div>

        {loading && (
          <div className="text-center py-20 text-orange-400 font-semibold animate-pulse text-lg">Loading sessions...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-semibold">No sessions found.</p>
          </div>
        )}

        {!loading && upcoming.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-1 flex-1 bg-gradient-to-r from-orange-400 to-transparent rounded-full" />
              <h2 className="text-lg font-bold text-orange-600 whitespace-nowrap">🔥 Upcoming Sessions ({upcoming.length})</h2>
              <div className="h-1 flex-1 bg-gradient-to-l from-orange-400 to-transparent rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcoming.map(s => <SessionCard key={s._id} s={s} />)}
            </div>
          </section>
        )}

        {!loading && past.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-1 flex-1 bg-gradient-to-r from-gray-300 to-transparent rounded-full" />
              <h2 className="text-lg font-bold text-gray-400 whitespace-nowrap">Past Sessions ({past.length})</h2>
              <div className="h-1 flex-1 bg-gradient-to-l from-gray-300 to-transparent rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {past.map(s => <SessionCard key={s._id} s={s} />)}
            </div>
          </section>
        )}
      </main>

      <footer className="px-10 py-6 mt-10 text-center text-sm text-[#5D4E37]"
        style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        © 2025 LARA Platform - All Rights Reserved
      </footer>
    </div>
  );
}