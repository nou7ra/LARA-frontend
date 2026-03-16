"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaArrowLeft, FaCreditCard, FaLock, FaCheckCircle } from "react-icons/fa";

export default function PaymentPage() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const price = searchParams.get("price");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    amount: "",
  });

  // ✅ خد السعر من الـ URL مباشرة
  useEffect(() => {
    if (price) {
      setFormData(prev => ({ ...prev, amount: price }));
    }
  }, [price]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  return (
    <div
      className="min-h-screen p-8 flex flex-col"
      style={{ background: "linear-gradient(to bottom, #FFE5B4, #FFF8E7, #FFFDF5)" }}
    >
      <style jsx global>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.5s ease-out forwards; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out forwards; }
        .shimmer-btn { background: linear-gradient(90deg, #f29633 0%, #ffb347 50%, #f29633 100%); background-size: 200% 100%; }
        .shimmer-btn:hover { animation: shimmer 1.5s infinite; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        .stagger-5 { animation-delay: 0.5s; opacity: 0; }
        .stagger-6 { animation-delay: 0.6s; opacity: 0; }
        .stagger-7 { animation-delay: 0.7s; opacity: 0; }
        .stagger-8 { animation-delay: 0.8s; opacity: 0; }
        input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1); }
        .confetti { position: absolute; width: 10px; height: 10px; animation: confetti 3s linear forwards; }
      `}</style>

      {/* Back Button */}
      <div className="max-w-xl mx-auto w-full mb-6 animate-slideDown">
        <Link href="/my-courses" className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors group">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </Link>
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto w-full">
        <div className="bg-white/80 backdrop-blur-sm px-8 py-10 rounded-2xl shadow-xl border border-orange-100 animate-fadeInLeft stagger-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaCreditCard className="text-orange-500 text-2xl animate-float" />
            <h1 className="text-3xl font-bold text-gray-800">Pay now</h1>
          </div>
          <p className="text-center text-sm text-gray-600 mb-8">
            Enter your payment information to complete your subscription
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-fadeInUp stagger-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name:</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                className="w-full rounded-xl border-2 border-gray-300 outline-none px-4 py-3 text-sm bg-white transition-all duration-300"
                placeholder="Enter your full name" required />
            </div>

            <div className="animate-fadeInUp stagger-3">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Email Address:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full rounded-xl border-2 border-gray-300 outline-none px-4 py-3 text-sm bg-white transition-all duration-300"
                placeholder="your.email@example.com" required />
            </div>

            <div className="animate-fadeInUp stagger-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">Credit Card Number:</label>
              <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange}
                className="w-full rounded-xl border-2 border-gray-300 outline-none px-4 py-3 text-sm bg-white transition-all duration-300"
                placeholder="1234 5678 9012 3456" maxLength={19} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="animate-fadeInUp stagger-5">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Expiry Date (MM/YY):</label>
                <input type="text" name="expiry" value={formData.expiry} onChange={handleChange}
                  placeholder="MM/YY"
                  className="w-full rounded-xl border-2 border-gray-300 outline-none px-4 py-3 text-sm bg-white transition-all duration-300"
                  maxLength={5} required />
              </div>
              <div className="animate-fadeInUp stagger-5">
                <label className="block text-sm font-semibold mb-2 text-gray-700">CVV:</label>
                <input type="password" name="cvv" value={formData.cvv} onChange={handleChange}
                  className="w-full rounded-xl border-2 border-gray-300 outline-none px-4 py-3 text-sm bg-white transition-all duration-300"
                  placeholder="123" maxLength={3} required />
              </div>
            </div>

            <div className="animate-fadeInUp stagger-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Amount: {formData.amount && Number(formData.amount) > 0 && (
  <span className="text-orange-500 font-bold">{formData.amount} EGP</span>
)}
              </label>
              <input type="number" name="amount" value={formData.amount}
                step="0.01"
                className="w-full rounded-xl border-2 border-gray-300 outline-none px-4 py-3 text-sm bg-gray-50 transition-all duration-300"
                placeholder="0 EGP" readOnly />
            </div>

            <div className="pt-4 animate-fadeInUp stagger-7">
              <button type="submit" disabled={isProcessing}
                className="shimmer-btn w-full py-4 rounded-xl text-white text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100">
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <><FaLock className="text-sm" /> Pay now</>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-gray-500 animate-fadeInUp stagger-8">
              🔒 Your payment information is secure and encrypted
            </p>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowSuccessModal(false)} />
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}px`,
                backgroundColor: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }} />
            ))}
          </div>

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-scaleIn relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
              <div className="mb-6 relative">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                  style={{ animationDuration: '1s', animationIterationCount: '3' }}>
                  <FaCheckCircle className="text-white text-5xl" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-400/30 rounded-full animate-ping" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                Payment successfully
                <span className="text-4xl animate-bounce" style={{ animationDuration: '0.6s' }}>🎉</span>
              </h2>
              <p className="text-gray-600 mb-8 text-sm">Your enrollment is confirmed! Get ready to start learning.</p>
              <Link href="/student-dashboard"
                className="inline-block w-full py-4 px-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group">
                <span className="relative z-10">Start the course now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <button onClick={() => setShowSuccessModal(false)} className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}