"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import api from "@/services/api";
import { FaUser, FaEnvelope, FaEdit, FaSave, FaCamera } from "react-icons/fa";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("/images/dashboard/Ellipse%2068.png");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    gender: "Male",
    phone: "",
    interests: [] as string[],
    skills: [] as string[],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/students/my-profile");
        const data = res.data.data;
        setProfileData({
          name: data.fullName || "",
          email: data.email || "",
          gender: "Male",
          phone: "",
          interests: data.interests || [],
          skills: data.skills || [],
        });
        if (data.avatar) setAvatarPreview(data.avatar);
      } catch (err) {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setProfileData(prev => ({ ...prev, name: user.name || "", email: user.email || "" }));
          if (user.avatar) setAvatarPreview(user.avatar);
        }
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    setAvatarFile(file);
  };
const handleAvatarUpload = async () => {
  if (!avatarFile) return;
  setSaving(true);
  try {
    const formData = new FormData();
    formData.append("name", profileData.name);
    formData.append("email", profileData.email);
    profileData.interests.forEach(i => formData.append("interests[]", i));
    profileData.skills.forEach(s => formData.append("skills[]", s));
    formData.append("avatar", avatarFile);

    const res = await api.put("/students/update-profile", formData, { // ✅ غيرنا الـ endpoint
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.avatar) setAvatarPreview(res.data.avatar);

    setAvatarFile(null);
    setSuccessMsg("Profile picture updated! ✅");
    setTimeout(() => setSuccessMsg(""), 3000);
  } catch (err) {
    console.error("Error uploading avatar:", err);
    setSuccessMsg("Failed to upload image ❌");
    setTimeout(() => setSuccessMsg(""), 3000);
  } finally {
    setSaving(false);
  }
};
 const handleSave = async () => {
  setSaving(true);
  try {
    const formData = new FormData();
    formData.append("name", profileData.name);
    formData.append("email", profileData.email);
    profileData.interests.forEach(i => formData.append("interests[]", i));
    profileData.skills.forEach(s => formData.append("skills[]", s));
    if (avatarFile) formData.append("avatar", avatarFile);

    const res = await api.put("/students/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.data.avatar) setAvatarPreview(res.data.avatar);

    setIsEditing(null);
    setAvatarFile(null);
    setSuccessMsg("Profile updated successfully! ✅");
    setTimeout(() => setSuccessMsg(""), 3000);
  } catch (err) {
    console.error("Error updating profile:", err);
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <style jsx global>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(255,174,116,0.3); } 50% { box-shadow: 0 0 30px rgba(255,174,116,0.6); } }
        .animate-fadeInDown { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <header className="h-[70px] sticky top-0 z-50 flex items-center justify-between px-9 shadow-lg animate-fadeInDown"
        style={{ background: "linear-gradient(to right, #ffb45a, #ffe6a5)" }}>
        <div className="flex items-center gap-4">
          <Link href="/"><Image src="/images/about/logo.png" alt="LARA logo" width={55} height={55} className="rounded-lg" /></Link>
          <input type="text" placeholder="Search" className="w-[190px] px-3.5 py-1.5 rounded-3xl border-none outline-none bg-white text-sm" />
        </div>
        <nav className="hidden md:flex gap-5 text-sm">
          <Link href="/my-courses" className="text-gray-800 hover:font-semibold">Home</Link>
          <Link href="/student-dashboard" className="text-gray-800 hover:font-semibold">Dashboard</Link>
          <Link href="/courses" className="text-gray-800 hover:font-semibold">Recommended Courses</Link>
          <Link href="/quiz" className="text-gray-800 hover:font-semibold">Quiz</Link>
        </nav>
        <div className="flex items-center gap-4 relative">
          <div className="cursor-pointer" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <img src={avatarPreview} alt="Profile" className="rounded-full border-2 border-white shadow-md object-cover w-10 h-10" />
          </div>
          {showProfileMenu && (
            <div className="absolute top-[54px] right-0 bg-white rounded-lg shadow-lg min-w-[130px] py-2 z-50">
              <Link href="/profile" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5] font-semibold">Profile</Link>
              <Link href="/login" className="block px-4 py-2 text-gray-800 text-sm hover:bg-[#ffe6c5]"
                onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); }}>Logout</Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <Link href="/student-dashboard" className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 mb-8 font-semibold transition-all">
          <span className="text-2xl">←</span> Back
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl p-10 animate-scaleIn border-2 border-orange-100">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative animate-pulse-glow">
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-[140px] h-[140px] rounded-full border-4 border-orange-300 object-cover"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-r from-orange-400 to-amber-300 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                title="Change profile picture"
              >
                <FaCamera className="text-white text-lg" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mt-4">{profileData.name}</h2>
            <p className="text-gray-500">{profileData.email}</p>

            {avatarFile !== null && (
              <button
                onClick={handleAvatarUpload}
                disabled={saving}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold rounded-full hover:scale-105 transition-transform shadow-md flex items-center gap-2"
              >
                <FaSave /> {saving ? "Saving..." : "Save Profile Picture"}
              </button>
            )}

            {successMsg && <p className="text-green-500 text-sm mt-2 font-medium">{successMsg}</p>}
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Full Name */}
            <div className="flex items-center justify-between border-2 border-orange-100 rounded-xl p-5 hover:shadow-lg transition-shadow bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-300 rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1 font-semibold">Full Name</div>
                  {isEditing === "name" ? (
                    <input type="text" value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="text-lg font-semibold border-2 border-orange-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  ) : (
                    <div className="text-lg font-semibold text-gray-800">{profileData.name || "—"}</div>
                  )}
                </div>
              </div>
              <button onClick={() => isEditing === "name" ? handleSave() : setIsEditing("name")}
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold rounded-full hover:scale-105 transition-transform shadow-md flex items-center gap-2">
                {isEditing === "name" ? <><FaSave /> {saving ? "..." : "Save"}</> : <><FaEdit /> Edit</>}
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between border-2 border-orange-100 rounded-xl p-5 hover:shadow-lg transition-shadow bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-300 rounded-full flex items-center justify-center">
                  <FaEnvelope className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1 font-semibold">Email</div>
                  {isEditing === "email" ? (
                    <input type="email" value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="text-lg font-semibold border-2 border-orange-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  ) : (
                    <div className="text-lg font-semibold text-gray-800">{profileData.email || "—"}</div>
                  )}
                </div>
              </div>
              <button onClick={() => isEditing === "email" ? handleSave() : setIsEditing("email")}
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold rounded-full hover:scale-105 transition-transform shadow-md flex items-center gap-2">
                {isEditing === "email" ? <><FaSave /> {saving ? "..." : "Save"}</> : <><FaEdit /> Edit</>}
              </button>
            </div>

            {/* Skills */}
            <div className="flex items-center justify-between border-2 border-orange-100 rounded-xl p-5 hover:shadow-lg transition-shadow bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-300 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1 font-semibold">Skills</div>
                  {isEditing === "skills" ? (
                    <input type="text"
                      value={profileData.skills.join(", ")}
                      onChange={(e) => setProfileData({ ...profileData, skills: e.target.value.split(",").map(s => s.trim()) })}
                      placeholder="e.g. React, Node.js, Python"
                      className="text-lg font-semibold border-2 border-orange-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  ) : (
                    <div className="text-lg font-semibold text-gray-800">
                      {profileData.skills.length > 0 ? profileData.skills.join(", ") : "—"}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => isEditing === "skills" ? handleSave() : setIsEditing("skills")}
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold rounded-full hover:scale-105 transition-transform shadow-md flex items-center gap-2">
                {isEditing === "skills" ? <><FaSave /> {saving ? "..." : "Save"}</> : <><FaEdit /> Edit</>}
              </button>
            </div>

            {/* Interests */}
            <div className="flex items-center justify-between border-2 border-orange-100 rounded-xl p-5 hover:shadow-lg transition-shadow bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-300 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">💡</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1 font-semibold">Interests</div>
                  {isEditing === "interests" ? (
                    <input type="text"
                      value={profileData.interests.join(", ")}
                      onChange={(e) => setProfileData({ ...profileData, interests: e.target.value.split(",").map(s => s.trim()) })}
                      placeholder="e.g. Web Development, AI, Design"
                      className="text-lg font-semibold border-2 border-orange-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  ) : (
                    <div className="text-lg font-semibold text-gray-800">
                      {profileData.interests.length > 0 ? profileData.interests.join(", ") : "—"}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => isEditing === "interests" ? handleSave() : setIsEditing("interests")}
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold rounded-full hover:scale-105 transition-transform shadow-md flex items-center gap-2">
                {isEditing === "interests" ? <><FaSave /> {saving ? "..." : "Save"}</> : <><FaEdit /> Edit</>}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}