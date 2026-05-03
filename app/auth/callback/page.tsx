"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ name, role, userId }));

      if (role === "instructor") {
        window.location.href = "/instructor-home";
      } else if (role === "admin") {
        window.location.href = "/admin-dashboard";
      } else {
        window.location.href = "/my-courses";
      }
    } else {
      window.location.href = "/login";
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 animate-pulse">Signing you in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackHandler />
    </Suspense>
  );
}