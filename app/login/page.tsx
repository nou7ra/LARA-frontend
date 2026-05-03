"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { handleLogin } from "@/services/login.js";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaFacebook, FaGoogle, FaGlobe } from "react-icons/fa";
import FacebookSignInModal from "@/components/auth/FacebookSignInModal";
import api from "@/services/api";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);

  const navigateUser = (userData: any) => {
    if (userData.role === "instructor") {
      window.location.href = "/instructor-home";
    } else if (userData.role === "admin") {
      window.location.href = "/admin-dashboard";
    } else {
      window.location.href = "/my-courses";
    }
  };

  // 1. تسجيل الدخول التقليدي
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await handleLogin(email, password, role);
      localStorage.setItem("token", data.token);
      const userData = data.user || data.admin || { name: data.name, email: data.email, role: data.role };
      localStorage.setItem("user", JSON.stringify(userData));
      navigateUser(userData);
    } catch (error: any) {
      alert(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. ✅ Google - redirect مباشرة للـ Passport
  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  // 3. Facebook
  const handleFacebookSignIn = async (accountName: string) => {
    setIsLoading(true);
    try {
      const response = await api.post("/students/facebook-login", {
        name: accountName,
        role: role,
      });
      const data = response.data;
      localStorage.setItem("token", data.token);
      const userData = data.user || data.admin;
      localStorage.setItem("user", JSON.stringify(userData));
      navigateUser(userData);
    } catch (error: any) {
      console.error("Facebook login error:", error);
      alert(error.response?.data?.message || "Facebook Sign-In failed");
    } finally {
      setIsLoading(false);
      setShowFacebookModal(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 overflow-hidden"
      style={{ background: "radial-gradient(circle at top, #ffbe8a, #ff9e45, #ffa85b)" }}
    >
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-orange-300/20 rounded-full blur-xl animate-float" />

      <div className="w-full max-w-[1100px] animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] transition-shadow duration-500">

          {/* Left Side - Form */}
          <div className="flex-1 px-8 md:px-12 py-10 relative flex flex-col justify-center items-center min-h-[550px]">
            <Link
              href="/signup"
              className="absolute top-6 right-6 px-6 py-2 rounded-full border-2 border-[#ff9c30] text-[#ff9c30] text-sm font-semibold hover:bg-gradient-to-r hover:from-[#ff9c30] hover:to-[#ffb347] hover:text-white hover:border-transparent hover:scale-105 hover:shadow-lg transition-all duration-300 animate-slideDown"
            >
              Sign Up
            </Link>

            <div className="w-full max-w-md mt-8">
              <div className="text-center mb-8 animate-slideDown" style={{ animationDelay: "0.1s" }}>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
                <p className="text-gray-500 text-sm font-medium">Login or sign up to the best courses</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative animate-slideUp" style={{ animationDelay: "0.15s" }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-full border-2 border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:shadow-md transition-all duration-300"
                    placeholder="Email"
                    required
                  />
                </div>

                <div className="relative animate-slideUp" style={{ animationDelay: "0.2s" }}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-full border-2 border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:shadow-md transition-all duration-300"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="relative animate-slideUp" style={{ animationDelay: "0.25s" }}>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-full border-2 border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-orange-400 focus:bg-white focus:shadow-md transition-all duration-300 cursor-pointer appearance-none"
                  >
                    <option value="student">👨‍🎓 Student</option>
                    <option value="instructor">👨‍🏫 Instructor</option>
                    <option value="admin">👨‍💼 Admin</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                </div>

                <div className="text-right animate-slideUp" style={{ animationDelay: "0.3s" }}>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-gray-500 hover:text-orange-500 transition-colors underline underline-offset-2"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <div className="pt-2 animate-slideUp" style={{ animationDelay: "0.35s" }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full max-w-[220px] mx-auto block py-3.5 bg-gradient-to-r from-[#ff9c30] to-[#ffb347] text-white rounded-full font-semibold text-base hover:from-[#e88b20] hover:to-[#ffa030] hover:scale-105 hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </button>
                </div>
              </form>

              <div className="mt-8 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center w-full my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                  <span className="mx-4 text-xs text-gray-400 font-medium uppercase tracking-wider">or sign in with</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>

                <div className="flex justify-center gap-4 animate-slideUp" style={{ animationDelay: "0.45s" }}>
                  <button
                    onClick={() => setShowFacebookModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-gray-200 bg-white text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-md hover:scale-105 transition-all duration-300 group"
                  >
                    <FaFacebook className="text-blue-600 group-hover:scale-110 transition-transform" />
                    Facebook
                  </button>

                  {/* ✅ Google - redirect مباشرة بدون modal */}
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-gray-200 bg-white text-sm text-gray-600 hover:border-red-400 hover:text-red-500 hover:shadow-md hover:scale-105 transition-all duration-300 group"
                  >
                    <FaGoogle className="text-red-500 group-hover:scale-110 transition-transform" />
                    Google
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute bottom-5 left-5 flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 cursor-pointer transition-colors animate-fadeIn" style={{ animationDelay: "0.5s" }}>
              <FaGlobe />
              <span>EN</span>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden md:block md:flex-[1.1] relative h-[550px] md:h-auto overflow-hidden group">
            <Image
              src="/images/auth/login-bg.jpeg.png"
              alt="Login Background"
              fill
              className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
              style={{ filter: "brightness(0.7)" }}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-10 left-8 right-8 text-white animate-slideUp" style={{ animationDelay: "0.6s" }}>
              <h3 className="text-2xl font-bold mb-2">Start Your Learning Journey</h3>
              <p className="text-sm opacity-90">Join thousands of students achieving their goals with LARA</p>
            </div>
          </div>
        </div>
      </div>

      <FacebookSignInModal
        isOpen={showFacebookModal}
        onClose={() => setShowFacebookModal(false)}
        onContinue={handleFacebookSignIn}
      />
    </div>
  );
}