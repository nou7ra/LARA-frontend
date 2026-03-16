"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLightbulb, FaBookOpen, FaStar, FaRocket, FaBrain, FaChartLine } from "react-icons/fa";
import api from "@/services/api";

export default function CoursesPage() {
  const router = useRouter();
  const [interest, setInterest] = useState("");
  const [previousCourses, setPreviousCourses] = useState("");
  const [skills, setSkills] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecommend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ حفظ الـ interests و skills في بروفايل الطالب
      await api.put("/students/update-profile", {
        interests: interest.split(",").map(s => s.trim()).filter(Boolean),
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        previousCourses: previousCourses.split(",").map(s => s.trim()).filter(Boolean),
      });

      // ✅ بعدين روح لصفحة الكورسات
      router.push("/courses-list");
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError("Failed to save. Please try again.");
      // حتى لو فيه error نروح لصفحة الكورسات
      router.push("/courses-list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex justify-center items-center p-5 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-orange-300/20 rounded-full blur-2xl animate-bounce" style={{ animationDuration: "3s" }} />
        <div className="absolute top-20 right-24 text-4xl text-orange-400/20 animate-bounce" style={{ animationDuration: "2s" }}>
          <FaBrain />
        </div>
        <div className="absolute bottom-32 left-24 text-3xl text-amber-500/20 animate-bounce" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }}>
          <FaChartLine />
        </div>
        <div className="absolute top-1/3 right-1/3 text-3xl text-orange-300/20 animate-bounce" style={{ animationDuration: "3s", animationDelay: "0.6s" }}>
          <FaRocket />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out forwards; }
        .animate-fadeInRight { animation: fadeInRight 0.6s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .shimmer-btn { background: linear-gradient(90deg, #e88700 0%, #ffb347 50%, #e88700 100%); background-size: 200% 100%; }
        .shimmer-btn:hover { animation: shimmer 1.5s infinite; }
        .input-glow:focus-within { box-shadow: 0 0 0 3px rgba(232, 135, 0, 0.2), 0 0 20px rgba(232, 135, 0, 0.1); }
      `}</style>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header Banner */}
        <div className="py-10 px-5 text-center mb-8 rounded-2xl animate-fadeInDown shadow-xl"
          style={{ background: "linear-gradient(135deg, #ffe0bb 0%, #ffb36c 50%, #ff9e47 100%)" }}>
          <div className="flex items-center justify-center gap-3 mb-3 animate-scaleIn" style={{ animationDelay: "0.2s" }}>
            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center animate-float">
              <FaBrain className="text-2xl text-orange-700" />
            </div>
            <h1 className="text-[36px] font-bold text-gray-800">Discover Your Learning Path</h1>
          </div>
          <p className="text-gray-700 text-base max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            Enter your details and leverage AI to get personalized and effective course suggestions 🚀
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm flex flex-col lg:flex-row min-h-[500px] rounded-2xl overflow-hidden border-4 shadow-2xl animate-scaleIn"
          style={{ borderColor: "#ffcc94", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 60px rgba(255,183,71,0.2)" }}>

          {/* Left Side - Form */}
          <div className="flex-1 px-10 py-12 relative">
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-orange-100 to-transparent rounded-br-full opacity-50" />

            <form onSubmit={handleRecommend} className="flex flex-col gap-5 max-w-lg mx-auto">
              {/* Interest */}
              <div className="animate-fadeInLeft" style={{ animationDelay: "0.4s" }}>
                <label className="flex items-center gap-2 text-sm text-gray-800 font-semibold mb-2">
                  <FaLightbulb className="text-orange-500" /> Your interest:
                </label>
                <div className={`relative input-glow rounded-full transition-all duration-300 ${focusedField === "interest" ? "transform scale-[1.02]" : ""}`}>
                  <input type="text" value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    onFocus={() => setFocusedField("interest")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-3.5 rounded-full border-2 border-gray-200 outline-none bg-gray-50 text-sm focus:border-orange-400 focus:bg-white transition-all duration-300"
                    placeholder="e.g. Programming, Design" required />
                </div>
              </div>

              {/* Previous Courses */}
              <div className="animate-fadeInLeft" style={{ animationDelay: "0.5s" }}>
                <label className="flex items-center gap-2 text-sm text-gray-800 font-semibold mb-2">
                  <FaBookOpen className="text-orange-500" /> Previous courses:
                </label>
                <div className={`relative input-glow rounded-full transition-all duration-300 ${focusedField === "previous" ? "transform scale-[1.02]" : ""}`}>
                  <input type="text" value={previousCourses}
                    onChange={(e) => setPreviousCourses(e.target.value)}
                    onFocus={() => setFocusedField("previous")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-3.5 rounded-full border-2 border-gray-200 outline-none bg-gray-50 text-sm focus:border-orange-400 focus:bg-white transition-all duration-300"
                    placeholder="e.g. Python, HTML, etc." />
                </div>
              </div>

              {/* Skills */}
              <div className="animate-fadeInLeft" style={{ animationDelay: "0.6s" }}>
                <label className="flex items-center gap-2 text-sm text-gray-800 font-semibold mb-2">
                  <FaStar className="text-orange-500" /> What are your skills?
                </label>
                <div className={`relative input-glow rounded-full transition-all duration-300 ${focusedField === "skills" ? "transform scale-[1.02]" : ""}`}>
                  <input type="text" value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    onFocus={() => setFocusedField("skills")}
                    onBlur={() => setFocusedField(null)}
                    className="w-full px-5 py-3.5 rounded-full border-2 border-gray-200 outline-none bg-gray-50 text-sm focus:border-orange-400 focus:bg-white transition-all duration-300"
                    placeholder="e.g. Problem solving, drawing" />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              {/* Submit Button */}
              <button type="submit" disabled={loading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="mt-6 w-full max-w-xs mx-auto py-4 px-9 flex justify-center items-center gap-2 shimmer-btn text-white font-semibold text-base rounded-full cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl animate-fadeInUp disabled:opacity-60"
                style={{ animationDelay: "0.7s", boxShadow: isHovered ? "0 10px 30px rgba(232,135,0,0.5)" : "0 6px 15px rgba(232,135,0,0.35)" }}>
                <FaRocket className={`text-lg ${isHovered ? "animate-bounce" : ""}`} />
                {loading ? "Loading..." : "Recommend Course"}
              </button>
            </form>

            <div className="flex justify-center gap-4 mt-8 animate-fadeInUp" style={{ animationDelay: "0.8s" }}>
              <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full text-xs font-semibold text-orange-700">
                <FaBrain /> AI-Powered
              </div>
              <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full text-xs font-semibold text-amber-700">
                <FaChartLine /> Personalized
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="flex-1 min-h-[400px] lg:min-h-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-900/50 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image src="/images/discover/Rectangle 4350.png" alt="AI Suggestion" width={600} height={500}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 animate-fadeInRight"
              style={{ filter: "brightness(1.05) saturate(1.1)", animationDelay: "0.3s" }} />
            <div className="absolute bottom-8 left-8 right-8 z-20 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-xl">
                <p className="text-gray-800 font-semibold text-lg mb-1">Smart AI Recommendations 🎯</p>
                <p className="text-gray-600 text-sm">Get courses tailored to your interests and skill level</p>
              </div>
            </div>
            <div className="absolute top-6 right-6 z-20 animate-float">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                ✨ Powered by AI
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
