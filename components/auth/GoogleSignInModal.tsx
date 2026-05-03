"use client";

import { useState, useEffect } from "react";
import { FaGoogle, FaTimes } from "react-icons/fa";

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (accountEmail: string) => void;
}

export default function GoogleSignInModal({ isOpen, onClose, onContinue }: GoogleSignInModalProps) {
  const [emailInput, setEmailInput] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
      setEmailInput("");
      setError("");
      setAgreedToTerms(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (!emailInput.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!emailInput.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service");
      return;
    }
    onContinue(emailInput.trim());
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        showModal ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all ${
          showModal ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
              <FaGoogle className="text-lg" style={{ color: "#4285f4" }} />
            </div>
            <span className="text-sm text-gray-600 font-medium">Sign in with Google</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          <h2 className="text-2xl font-normal text-gray-800 mb-2">Sign in with Google</h2>
          <p className="text-sm text-gray-600 mb-6">
            Continue to <span className="text-[#4285f4] font-medium">LARA</span>
          </p>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gmail Address
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <FaGoogle className="text-[#4285f4]" />
              </div>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setError(""); }}
                placeholder="Enter your Gmail address"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-[#4285f4] focus:outline-none transition-colors"
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          {/* Terms */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                  agreedToTerms ? "bg-[#4285f4] border-[#4285f4]" : "bg-white border-gray-400"
                }`}>
                  {agreedToTerms && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-600 leading-relaxed select-none">
                I agree to the Google{" "}
                <a href="#" className="text-[#4285f4] hover:underline" onClick={(e) => e.preventDefault()}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#4285f4] hover:underline" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              className={`px-8 py-2.5 text-sm font-medium text-white rounded-md transition-all ${
                emailInput && agreedToTerms
                  ? "bg-[#4285f4] hover:bg-[#3367d6] hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}