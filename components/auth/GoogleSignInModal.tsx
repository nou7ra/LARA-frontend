"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaGoogle, FaTimes } from "react-icons/fa";

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (accountEmail: string) => void;
}

export default function GoogleSignInModal({ isOpen, onClose, onContinue }: GoogleSignInModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>("nourhanhessen142@gmail.com");
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay to trigger animation
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (selectedAccount && agreedToTerms) {
      onContinue(selectedAccount);
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        showModal ? "bg-black/50 backdrop-blur-sm" : "bg-black/0"
      }`}
      onClick={handleBackdropClick}
    >
      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes modalSlideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-modalSlideOut {
          animation: modalSlideOut 0.2s ease-out forwards;
        }
      `}</style>

      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all ${
          showModal ? "animate-modalSlideIn" : "animate-modalSlideOut"
        }`}
      >
        {/* Header with Google Logo and Close Button */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
              <FaGoogle className="text-lg" style={{ color: "#4285f4" }} />
            </div>
            <span className="text-sm text-gray-600 font-medium">تسجيل الدخول-حسابات Google</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-8 py-6">
          {/* Title */}
          <h2 className="text-2xl font-normal text-gray-800 mb-2">Sign in with Google</h2>
          <p className="text-sm text-gray-600 mb-6">
            Continue to <span className="text-[#4285f4] font-medium">LARA</span>
          </p>

          {/* Selected Account */}
          <div
            className={`border-2 rounded-lg p-4 mb-3 cursor-pointer transition-all duration-300 ${
              selectedAccount === "nourhanhessen142@gmail.com"
                ? "border-[#4285f4] bg-blue-50/30 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setSelectedAccount("nourhanhessen142@gmail.com")}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                  NH
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">Nourhan Hessen</h3>
                <p className="text-xs text-gray-600 truncate">nourhanhessen142@gmail.com</p>
              </div>
              {selectedAccount === "nourhanhessen142@gmail.com" && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-[#4285f4] flex items-center justify-center transform scale-100 transition-transform duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Use Another Account */}
          <div
            className="border-2 border-gray-200 rounded-lg p-4 mb-5 cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 group"
            onClick={() => setSelectedAccount("another")}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-300 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Use another account</span>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-300 ${
                    agreedToTerms
                      ? "bg-[#4285f4] border-[#4285f4]"
                      : "bg-white border-gray-400 group-hover:border-gray-500"
                  }`}
                >
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
                  Privacy policy
                </a>
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-300 hover:shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedAccount || !agreedToTerms}
              className={`px-8 py-2.5 text-sm font-medium text-white rounded-md transition-all duration-300 ${
                selectedAccount && agreedToTerms
                  ? "bg-[#4285f4] hover:bg-[#3367d6] hover:shadow-lg hover:scale-105 active:scale-95"
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
