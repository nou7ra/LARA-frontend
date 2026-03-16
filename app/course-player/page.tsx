"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, Suspense } from "react";

type YTPlayer = {
  getCurrentTime: () => number;
  getDuration: () => number;
  destroy: () => void;
};
import { useSearchParams } from "next/navigation";
import { FaShare, FaBookmark, FaCheckCircle, FaPlayCircle, FaLock, FaPaperPlane, FaThumbsUp } from "react-icons/fa";
import api from "@/services/api";

interface Lesson {
  _id: string;
  title: string;
  type: "video" | "pdf";
  url: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  image?: string;
  instructor?: { name: string };
  materials?: Lesson[];
}

interface Comment {
  id: number;
  author: string;
  time: string;
  text: string;
  likes: number;
}

const getYouTubeId = (url: string): string => {
  if (!url) return "";
  if (url.includes("youtube.com/watch?v=")) return url.split("v=")[1]?.split("&")[0] || "";
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0] || "";
  return "";
};

const isYouTube = (url: string) => url?.includes("youtube.com") || url?.includes("youtu.be");
const isGoogleDrive = (url: string) => url?.includes("drive.google.com");

const getDriveEmbedUrl = (url: string) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
  return url;
};

function CoursePlayerContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const userObj = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : {};
  const studentId = userObj._id || userObj.id || userObj.email || "guest";
  const studentName = userObj.name || "You";

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);
  const ytIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const currentLessonIdRef = useRef<string>("");
  const completedLoadedRef = useRef(false);

  useEffect(() => {
    if (courseId) {
      const saved = localStorage.getItem(`completed_${studentId}_${courseId}`);
      if (saved) setCompletedLessons(new Set(JSON.parse(saved)));
      completedLoadedRef.current = true;
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) {
      window.location.href = "/courses-list";
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      const saved = localStorage.getItem(`comments_${studentId}_${courseId}`);
      if (saved) setComments(JSON.parse(saved));
    }
  }, [courseId]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get("/students/courses");
        const found = (res.data.courses || []).find((c: Course) => c._id === courseId);
        if (found) {
          setCourse(found);
          const firstVideo = found.materials?.find((m: Lesson) => m.type === "video");
          if (firstVideo) setCurrentLesson(firstVideo);
          else if (found.materials?.length > 0) setCurrentLesson(found.materials[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourse();
    else setLoading(false);
  }, [courseId]);

  useEffect(() => {
    setVideoProgress(0);
    currentLessonIdRef.current = currentLesson?._id || "";
    if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
    if (ytPlayerRef.current) { try { ytPlayerRef.current.destroy(); } catch {} ytPlayerRef.current = null; }
    if (!currentLesson || !isYouTube(currentLesson.url)) return;

    const videoId = getYouTubeId(currentLesson.url);
    if (!videoId) return;

    const initPlayer = () => {
      if (!ytContainerRef.current || !(window as any).YT?.Player) return;
      ytPlayerRef.current = new (window as any).YT.Player(ytContainerRef.current, {
        videoId,
        playerVars: { autoplay: 0, controls: 1, rel: 0 },
        events: {
          onStateChange: (event: any) => {
            if (event.data === 0) {
              setVideoProgress(100);
              if (currentLessonIdRef.current) {
                setCompletedLessons(prev => new Set([...prev, currentLessonIdRef.current]));
              }
            }
            if (event.data === 1) {
              if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
              ytIntervalRef.current = setInterval(() => {
                try {
                  const player = ytPlayerRef.current;
                  if (!player) return;
                  const current = player.getCurrentTime?.() || 0;
                  const duration = player.getDuration?.() || 1;
                  const pct = Math.round((current / duration) * 100);
                  setVideoProgress(pct);
                  if (pct >= 95 && currentLessonIdRef.current) {
                    setCompletedLessons(prev => new Set([...prev, currentLessonIdRef.current]));
                  }
                } catch {}
              }, 1000);
            }
            if (event.data === 2) {
              if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
            }
          },
        },
      });
    };

    if ((window as any).YT?.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("yt-api-script")) {
        const tag = document.createElement("script");
        tag.id = "yt-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
      if (ytPlayerRef.current) { try { ytPlayerRef.current.destroy(); } catch {} ytPlayerRef.current = null; }
    };
  }, [currentLesson]);

  const videos = (course?.materials || []).filter(m => m.type === "video");
  const pdfs = (course?.materials || []).filter(m => m.type === "pdf");

  const toggleComplete = (id: string) => {
    setCompletedLessons(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      const pct = Math.round((video.currentTime / video.duration) * 100);
      setVideoProgress(pct);
      if (pct >= 90 && currentLesson) setCompletedLessons(prev => new Set([...prev, currentLesson._id]));
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      author: studentName,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: commentText.trim(),
      likes: 0,
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    if (courseId) localStorage.setItem(`comments_${studentId}_${courseId}`, JSON.stringify(updated));
    setCommentText("");
  };

  const handleLike = (id: number) => {
    const updated = comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c);
    setComments(updated);
    if (courseId) localStorage.setItem(`comments_${studentId}_${courseId}`, JSON.stringify(updated));
  };

  useEffect(() => {
    if (courseId && completedLoadedRef.current) {
      localStorage.setItem(`completed_${studentId}_${courseId}`, JSON.stringify([...completedLessons]));
      const allVideos = (course?.materials || []).filter((m: any) => m.type === "video");
      if (allVideos.length > 0) {
        const pct = Math.round((completedLessons.size / allVideos.length) * 100);
        localStorage.setItem(`progress_pct_${studentId}_${courseId}`, String(pct));
        api.post("/students/save-progress", { courseId, progress: pct })
          .catch(err => console.error("Save progress error:", err));
      }
    }
  }, [completedLessons, courseId]);

  useEffect(() => {
    if (!courseId || !currentLesson || !course) return;
    const allVideos = (course.materials || []).filter((m: any) => m.type === "video");
    if (allVideos.length === 0) return;

    const completedFull = completedLessons.size;
    const partialFromCurrent = completedLessons.has(currentLesson._id) ? 0 : videoProgress / 100;
    const totalPct = Math.round(((completedFull + partialFromCurrent) / allVideos.length) * 100);
    const finalPct = Math.min(totalPct, 100);

    localStorage.setItem(`progress_pct_${studentId}_${courseId}`, String(finalPct));

    if (finalPct % 10 === 0 && finalPct > 0) {
      api.post("/students/save-progress", { courseId, progress: finalPct })
        .catch(err => console.error("Save progress error:", err));
    }
  }, [videoProgress, courseId, currentLesson, completedLessons, course]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <p className="text-gray-500 text-lg animate-pulse">Loading course...</p>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-orange-50">
      <p className="text-red-500 text-lg">Course not found.</p>
      <Link href="/courses-list" className="text-orange-500 underline">Back to Courses</Link>
    </div>
  );

  const overallPct = videos.length > 0 ? Math.round((completedLessons.size / videos.length) * 100) : 0;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSave = async () => {
    if (saved) return;
    try {
      await api.post("/students/save-course", { courseId: course?._id });
      setSaved(true);
    } catch {
      const savedCourses = JSON.parse(localStorage.getItem("savedCourses") || "[]");
      if (!savedCourses.includes(course?._id)) {
        savedCourses.push(course?._id);
        localStorage.setItem("savedCourses", JSON.stringify(savedCourses));
      }
      setSaved(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <style>{`
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out forwards; }
        .animate-fadeInRight { animation: fadeInRight 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
      `}</style>

      <header className="h-[70px] sticky top-0 z-50 flex items-center justify-between px-9 shadow-lg animate-fadeInDown"
        style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="flex items-center gap-4">
          <Link href="/my-courses">
            <Image src="/images/about/logo.png" alt="LARA" width={55} height={55} className="rounded-lg" />
          </Link>
          <input type="text" placeholder="Search" className="w-[190px] px-3.5 py-1.5 rounded-3xl border-none outline-none bg-white text-sm" />
        </div>
        <nav className="hidden md:flex gap-5 text-sm">
          <Link href="/my-courses" className="text-gray-800 hover:font-semibold">Home</Link>
          <Link href="/student-dashboard" className="text-gray-800 hover:font-semibold">Dashboard</Link>
          <Link href="/course-player" className="text-gray-800 font-semibold border-b-2 border-gray-800">Course Player</Link>
          <Link href="/courses" className="text-gray-800 hover:font-semibold">Recommended Courses</Link>
          <Link href="/quiz" className="text-gray-800 hover:font-semibold">Quiz</Link>
          <Link href="/about" className="text-gray-800 hover:font-semibold">About</Link>
        </nav>
        <div className="relative">
          <div className="cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <Image src="/images/dashboard/Ellipse%2068.png" alt="Profile" width={40} height={40} className="rounded-full border-2 border-white shadow-md" />
          </div>
          {showProfileMenu && (
            <div className="absolute top-[54px] right-0 bg-white rounded-lg shadow-lg min-w-[130px] py-2 z-50">
              <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-[#ffe6c5]">Profile</Link>
              <Link href="/login" className="block px-4 py-2 text-sm hover:bg-[#ffe6c5]"
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); }}>
                Logout
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4 animate-fadeInUp">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {course.instructor?.name && `By ${course.instructor.name} · `}
              <span className="capitalize">{course.level}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleShare}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-full font-semibold hover:scale-105 transition-transform shadow-md flex items-center gap-2">
              <FaShare /> {copied ? "Copied! ✅" : "Share"}
            </button>
            <button onClick={handleSave}
              className={`px-5 py-2.5 rounded-full font-semibold hover:scale-105 transition-transform shadow-md flex items-center gap-2 ${
                saved ? "bg-green-500 text-white" : "bg-gradient-to-r from-orange-500 to-orange-400 text-white"
              }`}>
              <FaBookmark /> {saved ? "Saved ✅" : "Save"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl animate-fadeInLeft aspect-video">
              {currentLesson?.url ? (
                isYouTube(currentLesson.url) ? (
                  <div ref={ytContainerRef} className="w-full h-full" />
                ) : isGoogleDrive(currentLesson.url) ? (
                  <iframe src={getDriveEmbedUrl(currentLesson.url)} className="w-full h-full" allowFullScreen />
                ) : (
                  <video ref={videoRef} src={currentLesson.url} controls className="w-full h-full" onTimeUpdate={handleTimeUpdate} />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-center">
                  <div>
                    <div className="text-6xl mb-4">▶️</div>
                    <p>{currentLesson?.title || "Select a lesson"}</p>
                  </div>
                </div>
              )}
            </div>

            {pdfs.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <h3 className="font-bold text-lg mb-3">📄 Course Materials</h3>
                <div className="space-y-2">
                  {pdfs.map(pdf => (
                    <a key={pdf._id} href={pdf.url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all">
                      <span className="text-2xl">📄</span>
                      <span className="text-sm font-medium text-gray-700">{pdf.title}</span>
                      <span className="ml-auto text-orange-500 text-xs">Open →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-lg animate-fadeInUp">
              <h3 className="font-bold text-lg mb-4">💬 Comments ({comments.length})</h3>
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {studentName[0]?.toUpperCase()}
                </div>
                <input type="text" placeholder="Add a comment..." value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddComment()}
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-full outline-none focus:ring-2 focus:ring-orange-300 text-sm border border-gray-200" />
                <button onClick={handleAddComment} className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors">
                  <FaPaperPlane className="text-white" />
                </button>
              </div>
              {comments.length === 0 && (
                <p className="text-center text-gray-400 py-4">No comments yet. Be the first! 💬</p>
              )}
              <div className="space-y-5">
                {comments.map(c => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {c.author[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{c.author}</span>
                        <span className="text-gray-400 text-xs">{c.time}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed mb-2">{c.text}</p>
                      <div className="flex gap-4">
                        <button onClick={() => handleLike(c.id)} className="flex items-center gap-1 text-blue-500 text-sm font-semibold">
                          <FaThumbsUp /> Like {c.likes > 0 && <span className="text-xs text-gray-400">({c.likes})</span>}
                        </button>
                        <button className="text-gray-500 text-sm font-semibold">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24 animate-fadeInRight">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Sessions</h3>
                <span className="text-sm font-semibold">
                  <span className="text-orange-600">{completedLessons.size}</span>/{videos.length} Done
                </span>
              </div>

              {videos.length === 0 ? (
                <p className="text-gray-400 text-sm">No video lessons yet.</p>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {videos.map((lesson, index) => {
                    const isActive = currentLesson?._id === lesson._id;
                    const isDone = completedLessons.has(lesson._id);
                    return (
                      <div key={lesson._id} onClick={() => setCurrentLesson(lesson)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                          isActive ? "bg-orange-50 border-orange-400"
                          : isDone ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200 hover:border-orange-300"
                        }`}>
                        <div className="flex items-center gap-3">
                          {isDone
                            ? <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                            : isActive
                            ? <FaPlayCircle className="text-orange-500 text-xl flex-shrink-0" />
                            : <FaLock className="text-gray-400 text-lg flex-shrink-0" />}
                          <p className={`text-sm font-medium flex-1 ${isActive ? "text-orange-700 font-semibold" : "text-gray-700"}`}>
                            {String(index + 1).padStart(2, "0")}. {lesson.title}
                          </p>
                          <button onClick={e => { e.stopPropagation(); toggleComplete(lesson._id); }}
                            className={`text-xs px-2 py-1 rounded-full border transition-all ${
                              isDone ? "bg-green-100 border-green-300 text-green-600" : "bg-gray-100 border-gray-200 text-gray-500 hover:bg-orange-100"
                            }`}>
                            {isDone ? "✓" : "○"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentLesson && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="truncate pr-1">📺 Current Lesson</span>
                    <span className="font-bold text-orange-600 flex-shrink-0">{videoProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-300"
                      style={{ width: `${videoProgress}%` }} />
                  </div>
                  {videoProgress >= 95 && <p className="text-green-500 text-xs mt-1 font-semibold">✅ Completed!</p>}
                </div>
              )}

              {videos.length > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Overall Progress</span>
                    <span className="font-semibold text-orange-600">{overallPct}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${overallPct}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="px-10 py-8 mt-10" style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="flex justify-between items-center mb-6">
          <Image src="/images/my-courses/logo.png" alt="LARA" width={70} height={70} className="rounded-lg" />
          <div className="flex gap-3">
            {["f", "𝕏", "in", "📷", "▶️"].map((icon, i) => (
              <div key={i} className="w-11 h-11 bg-[#d98a47] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{icon}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-sm text-[#5D4E37]">© 2025 LARA Platform - All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default function CoursePlayerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoursePlayerContent />
    </Suspense>
  );
}