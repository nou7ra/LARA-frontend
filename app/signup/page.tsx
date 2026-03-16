"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaUser, FaPhone, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaFacebook, FaGoogle, FaGlobe } from "react-icons/fa";
import GoogleSignInModal from "@/components/auth/GoogleSignInModal";
import FacebookSignInModal from "@/components/auth/FacebookSignInModal";
import api from "@/services/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    role: "student",
    password: "",
    email: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let registerEndpoint = "";
      let loginEndpoint = "";
      let payload: any = {};

      if (formData.role === "student") {
        registerEndpoint = "/auth/register";
        loginEndpoint = "/auth/login";
        payload = { name: formData.fullName, email: formData.email, password: formData.password, phone: formData.phone, role: "student" };
      } else if (formData.role === "instructor") {
        registerEndpoint = "/instructor/register";
        loginEndpoint = "/instructor/login";
        payload = { name: formData.fullName, email: formData.email, password: formData.password, phone: formData.phone };
      } else if (formData.role === "admin") {
        registerEndpoint = "/admin/create";
        loginEndpoint = "/admin/login";
        payload = { name: formData.fullName, email: formData.email, password: formData.password };
      }

      // ✅ 1. Register
      await api.post(registerEndpoint, payload);

      // ✅ 2. Login تلقائي بعد الـ register
      const loginRes = await api.post(loginEndpoint, {
        email: formData.email,
        password: formData.password,
      });

      // ✅ 3. حفظ التوكن والبيانات
      const token = loginRes.data.token;
      if (token) localStorage.setItem("token", token);

      const userData = loginRes.data.user || loginRes.data.admin || loginRes.data.instructor || {};
      localStorage.setItem("user", JSON.stringify({ ...userData, role: formData.role }));

      // ✅ 4. Redirect
      if (formData.role === "instructor") window.location.href = "/instructor-home";
      else if (formData.role === "admin") window.location.href = "/admin-dashboard";
      else window.location.href = "/my-courses";

    } catch (error: any) {
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignUp = (accountEmail: string) => {
    setIsLoading(true);
    setTimeout(() => {
      if (formData.role === "instructor") window.location.href = "/instructor-home";
      else if (formData.role === "admin") window.location.href = "/admin-dashboard";
      else window.location.href = "/my-courses";
    }, 800);
  };

  const handleFacebookSignUp = (accountName: string) => {
    setIsLoading(true);
    setTimeout(() => {
      if (formData.role === "instructor") window.location.href = "/instructor-home";
      else if (formData.role === "admin") window.location.href = "/admin-dashboard";
      else window.location.href = "/my-courses";
    }, 800);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 overflow-hidden"
      style={{ background: "radial-gradient(circle at top, #ffbe8a, #ff9e45, #ffa85b)" }}
    >
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-orange-300/20 rounded-full blur-xl animate-float" />

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.5s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-[1100px] animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] transition-shadow duration-500">

          {/* Left Side - Form */}
          <div className="flex-1 px-8 md:px-12 py-10 relative flex flex-col justify-center items-center min-h-[550px]">
            <Link href="/login"
              className="absolute top-6 right-6 px-6 py-2 rounded-full border-2 border-[#ff9c30] text-[#ff9c30] text-sm font-semibold hover:bg-gradient-to-r hover:from-[#ff9c30] hover:to-[#ffb347] hover:text-white hover:border-transparent hover:scale-105 hover:shadow-lg transition-all duration-300 animate-slideDown">
              Login
            </Link>

            <div className="w-full max-w-md mt-8">
              <div className="text-center mb-8 animate-slideDown" style={{ animationDelay: "0.1s" }}>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                <p className="text-gray-500 text-sm font-medium">Unlock Knowledge And Grow Your Skills Today!</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="relative animate-slideUp" style={{ animationDelay: "0.15s" }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FaUser /></div>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-full border-2 border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:shadow-md transition-all duration-300"
                    placeholder="Full Name" required />
                </div>

                {/* Phone */}
                <div className="relative animate-slideUp" style={{ animationDelay: "0.2s" }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FaPhone /></div>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-full border-2 border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:shadow-md transition-all duration-300"
                    placeholder="Phone" required />
                </div>

                {/* Email */}
                <div className="relative animate-slideUp" style={{ animationDelay: "0.25s" }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FaEnvelope /></div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 rounded-full border-2 border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:shadow-md transition-all duration-300"
                    placeholder="Email Address" required />
                </div>

                {/* Password */}
                <div className="relative animate-slideUp" style={{ animationDelay: "0.3s" }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><FaLock /></div>
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3.5 rounded-full border-2 border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:shadow-md transition-all duration-300"
                    placeholder="Password" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Role */}
                <div className="relative animate-slideUp" style={{ animationDelay: "0.35s" }}>
                  <select name="role" value={formData.role} onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-full border-2 border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:shadow-md transition-all duration-300 cursor-pointer appearance-none">
                    <option value="student">👨‍🎓 Student</option>
                    <option value="instructor">👨‍🏫 Instructor</option>
                    <option value="admin">👨‍💼 Admin</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>

                {/* Sign Up Button */}
                <div className="pt-2 animate-slideUp" style={{ animationDelay: "0.4s" }}>
                  <button type="submit" disabled={isLoading}
                    className="w-full max-w-[220px] mx-auto block py-3.5 bg-gradient-to-r from-[#ff9c30] to-[#ffb347] text-white rounded-full font-semibold text-base hover:from-[#e88b20] hover:to-[#ffa030] hover:scale-105 hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100">
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating...
                      </span>
                    ) : "Sign Up"}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="mt-8 animate-fadeIn" style={{ animationDelay: "0.45s" }}>
                <div className="flex items-center w-full my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <span className="mx-4 text-xs text-gray-400 font-medium uppercase tracking-wider">or sign up with</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>

                <div className="flex justify-center gap-4 animate-slideUp" style={{ animationDelay: "0.5s" }}>
                  <button onClick={() => setShowFacebookModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-gray-200 bg-white text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-md hover:scale-105 transition-all duration-300 group">
                    <FaFacebook className="text-blue-600 group-hover:scale-110 transition-transform" />
                    Facebook
                  </button>
                  <button onClick={() => setShowGoogleModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-gray-200 bg-white text-sm text-gray-600 hover:border-red-400 hover:text-red-500 hover:shadow-md hover:scale-105 transition-all duration-300 group">
                    <FaGoogle className="text-red-500 group-hover:scale-110 transition-transform" />
                    Google
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-5 left-5 flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 cursor-pointer transition-colors animate-fadeIn" style={{ animationDelay: "0.55s" }}>
              <FaGlobe />
              <span>EN</span>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden md:block md:flex-[1.1] relative h-[550px] md:h-auto overflow-hidden group">
            <Image
              src="/images/auth/create-bg.jpeg.png"
              alt="Student watching online course"
              fill
              className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              style={{ filter: "brightness(0.7)" }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-8 right-8 text-white animate-slideUp" style={{ animationDelay: "0.6s" }}>
              <h3 className="text-2xl font-bold mb-2">Join Our Community! 🌟</h3>
              <p className="text-sm opacity-90">Start your learning journey with thousands of students worldwide</p>
            </div>
          </div>
        </div>
      </div>

      <GoogleSignInModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} onContinue={handleGoogleSignUp} />
      <FacebookSignInModal isOpen={showFacebookModal} onClose={() => setShowFacebookModal(false)} onContinue={handleFacebookSignUp} />
    </div>
  );
}