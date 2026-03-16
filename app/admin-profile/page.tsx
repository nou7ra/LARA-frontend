"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { AdminProfileFooter } from "@/components/admin-dashboard";
import api from "@/services/api";

export default function AdminProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      const nameParts = (user.name || "").split(" ");
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName:  nameParts.slice(1).join(" ") || "",
        email:     user.email || "",
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
      };
      if (formData.password) payload.password = formData.password;

      await api.put("/admin/profile", payload);

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      savedUser.name = payload.name;
      savedUser.email = payload.email;
      localStorage.setItem("user", JSON.stringify(savedUser));

      setSuccessMsg("Profile updated successfully! ✅");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="px-8 py-6">
        <Link href="/admin-dashboard"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors group">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </Link>
      </div>

      <main className="flex-1 px-8 pb-12 max-w-3xl mx-auto w-full">
        {successMsg && (
          <div className="mb-4 px-4 py-3 bg-green-100 text-green-700 rounded-xl text-sm font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-orange-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {formData.firstName?.[0]?.toUpperCase() || "A"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-2">Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm text-gray-600 mb-2">New Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password"
                  value={formData.password} onChange={handleChange} placeholder="Leave blank to keep current"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm new password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-[#FF8A00] to-[#FFB84D] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>

      <AdminProfileFooter />
    </div>
  );
}