"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaCamera } from "react-icons/fa";

interface ProfileImageProps {
  name?: string;
  onImageChange?: (file: File) => void;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ name, onImageChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = name ? name.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    if (savedImage) setPreview(savedImage);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageChange?.(file);
    }
  };

  return (
    <div className="relative w-20 h-20 mb-6 animate-fadeIn group">
      {preview ? (
        <img
          src={preview}
          alt="Profile"
          className="w-full h-full rounded-full object-cover border-4 border-orange-300 shadow-lg"
        />
      ) : (
        <div className="w-full h-full rounded-full border-4 border-orange-300 bg-orange-100 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-orange-500">{initials}</span>
        </div>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-md hover:bg-orange-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
      >
        <FaCamera className="text-xs" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfileImage;