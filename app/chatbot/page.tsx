"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function ChatBotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! 👋 I'm LARA, your learning assistant. What can I help you with today?",
      isBot: true,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getBotResponse = (message: string): string => {
    const msg = message.toLowerCase();

    if (msg.includes("hi") || msg.includes("hello") || msg.includes("مرحبا") || msg.includes("هاي") || msg.includes("السلام"))
      return "Hi there! 👋 How can I help you today?";

    if (msg.includes("course") || msg.includes("كورس") || msg.includes("كورسات"))
      return "We have amazing courses in Design, Development, and more! Check out the Courses section 📚";

    if (msg.includes("design") || msg.includes("تصميم"))
      return "We have great Design courses like Interior Design, 3D Design, UI/UX and more! 🎨";

    if (msg.includes("certificate") || msg.includes("شهادة"))
      return "You'll get a certificate after completing your course and passing the final quiz! 🎓";

    if (msg.includes("quiz") || msg.includes("كويز") || msg.includes("exam") || msg.includes("اختبار"))
      return "Complete your course 100% to unlock the final quiz. You need 60% to pass! 💪";

    if (msg.includes("progress") || msg.includes("تقدم"))
      return "You can track your progress from the Student Dashboard. Keep going! 🚀";

    if (msg.includes("price") || msg.includes("سعر") || msg.includes("تكلفة") || msg.includes("cost"))
      return "We have courses for all budgets! Check the Courses section for pricing details 💰";

    if (msg.includes("help") || msg.includes("مساعدة"))
      return "I'm here to help! You can ask me about courses, learning tips, or anything about LARA platform 😊";

    if (msg.includes("tip") || msg.includes("نصيحة") || msg.includes("study") || msg.includes("دراسة"))
      return "Here are some study tips:\n1. Set a daily learning goal ⏰\n2. Take notes while watching 📝\n3. Practice what you learn 💡\n4. Don't rush — consistency is key! 🔑";

    if (msg.includes("thank") || msg.includes("شكرا") || msg.includes("شكراً"))
      return "You're welcome! Happy to help 😊";

    if (msg.includes("bye") || msg.includes("مع السلامة") || msg.includes("باي"))
      return "Goodbye! Keep learning and growing! 👋🌟";

    if (msg.includes("enroll") || msg.includes("تسجيل") || msg.includes("اشتراك"))
      return "To enroll in a course, go to the Courses section and click Enroll. It's easy! 🎯";

    if (msg.includes("instructor") || msg.includes("مدرب") || msg.includes("استاذ"))
      return "Our instructors are experienced professionals ready to guide you! You can find them in each course page 👨‍🏫";

    return "That's a great question! Please visit our courses section or contact support for more help 😊";
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    const userMessage = { id: Date.now(), text: userText, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    setTimeout(() => {
      const botText = getBotResponse(userText);
      const botMessage = { id: Date.now() + 1, text: botText, isBot: true };
      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "linear-gradient(to bottom, #FFD9B8, #FFF7E6)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[700px] flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#FFAE74] to-[#FFF4B7] p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt="LARA Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div>
              <h2 className="font-bold text-lg text-gray-900">LARA Assistant</h2>
              <p className="text-sm text-gray-700">Online • Always here to help</p>
            </div>
          </div>
          <Link href="/student-dashboard" className="text-gray-700 hover:text-gray-900 text-2xl font-bold">
            ✕
          </Link>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
              {message.isBot && (
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center text-xl mr-3 flex-shrink-0">
                  🤖
                </div>
              )}
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl whitespace-pre-wrap ${
                  message.isBot
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gradient-to-r from-[#FFAE74] to-[#FFF4B7] text-gray-900"
                }`}
              >
                {message.text}
              </div>
              {!message.isBot && (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-xl ml-3 flex-shrink-0">
                  👤
                </div>
              )}
            </div>
          ))}

          {/* Loading dots */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center text-xl mr-3">
                🤖
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Bar */}
        <footer className="p-4 border-t border-gray-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write a message..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="w-12 h-12 bg-gradient-to-r from-[#FFAE74] to-[#FFF4B7] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <span className="text-2xl">➤</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}