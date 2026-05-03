"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import api from "@/services/api";
import {
  InstructorProfileNavbar,
  ProfileImage,
  ProfileField,
  ProfileBio,
  PasswordField,
  InstructorProfileFooter,
} from "@/components/instructor-profile";

export default function InstructorProfile() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const nameParts = user.name ? user.name.split(" ") : ["", ""];
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
    }
  }, []);

  const handleSaveChanges = async () => {
    if (!firstName || !lastName || !email) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await api.put("/instructor/profile", {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        bio,
        ...(currentPassword && newPassword && {
          currentPassword,
          newPassword,
        }),
      });

      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        name: `${firstName} ${lastName}`,
        email,
        phone,
        bio,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccessMsg("Profile updated successfully! ✅");
      setCurrentPassword("");
      setNewPassword("");

      setTimeout(() => {
        window.location.href = "/instructor-home";
      }, 2000);

    } catch (error) {
      console.error("Update profile error:", error);
      setErrorMsg(
        (error as any).response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ بترفع الصورة للـ backend وتحفظها في الـ database
  const handleImageChange = async (file: File) => {
    try {
      // ✅ احفظي في localStorage عشان تظهر فوراً
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        localStorage.setItem("profileImage", base64);
        window.dispatchEvent(new Event("profileImageUpdated"));
      };
      reader.readAsDataURL(file);

      // ✅ ابعتي الصورة للـ backend
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await api.post("/instructor/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ حفظي الـ avatar URL في الـ localStorage
      const updatedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        avatar: res.data.avatar,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      console.log("Avatar uploaded:", res.data.avatar);
    } catch (error) {
      console.error("Avatar upload error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFD9B8] to-[#FFF7E6]">
      <InstructorProfileNavbar />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-800 hover:text-orange-600 transition-colors mb-6 animate-fadeIn"
        >
          <FaArrowLeft />
          <span className="font-medium">Back</span>
        </Link>

        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
          <ProfileImage
            name={firstName}
            onImageChange={handleImageChange}
          />

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ProfileField label="First Name" value={firstName} onChange={setFirstName} placeholder="Enter first name" delay={0.1} />
              <ProfileField label="Last Name" value={lastName} onChange={setLastName} placeholder="Enter last name" delay={0.15} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ProfileField label="Email" value={email} onChange={setEmail} type="email" placeholder="Enter email" delay={0.2} />
              <ProfileField label="Phone" value={phone} onChange={setPhone} type="tel" placeholder="Enter phone number" delay={0.25} />
            </div>

            <ProfileBio value={bio} onChange={setBio} delay={0.3} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PasswordField label="Current Password" value={currentPassword} onChange={setCurrentPassword} placeholder="*****" delay={0.35} />
              <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} placeholder="*****" delay={0.4} />
            </div>

            {successMsg && <p className="text-green-600 text-sm font-medium">{successMsg}</p>}
            {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}

            <div className="flex justify-end pt-4 animate-slideUp" style={{ animationDelay: "0.45s" }}>
              <button
                onClick={handleSaveChanges}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#FF8A00] to-[#FFB84D] text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <InstructorProfileFooter />
    </div>
  );
}