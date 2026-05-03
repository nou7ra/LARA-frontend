"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [completedScore, setCompletedScore] = useState(0);

  useEffect(() => {
    if (!courseId) {
      const fetchMyCourses = async () => {
        try {
          const savedUser = localStorage.getItem("user");
          const userData = savedUser ? JSON.parse(savedUser) : {};
          const studentId = userData._id || userData.id || "guest";
          const res = await api.get("/students/courses");
          const allCourses = res.data.courses || [];
          const completed = allCourses.filter((c: any) => {
            const pct = localStorage.getItem(`progress_pct_${studentId}_${c._id}`);
            return pct !== null && parseInt(pct) === 100;
          });
          setMyCourses(completed);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchMyCourses();
    }
  }, [courseId]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const userData = savedUser ? JSON.parse(savedUser) : {};
    const id = userData._id || userData.id || "guest";
    setStudentId(id);
  }, []);

  useEffect(() => {
    if (!courseId) return;
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/students/course-exam/${courseId}`);
        const exam = response.data.exam;
        if (exam?.questions?.length > 0) {
          setQuestions(exam.questions);
        } else {
          setError("No questions found for this course.");
        }
      } catch (err) {
        setError("Failed to load quiz. Please try again.");
        console.error("Error fetching quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId]);

  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setQuizCompleted(true);
    }
  }, [timeLeft, quizCompleted, loading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = async () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer || "";
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      await api.post(`/students/submit-exam/${courseId}`, { studentAnswers: newAnswers });
      localStorage.setItem(`quiz_done_${studentId}_${courseId}`, String(newScore));
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
    }
  };

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8"
        style={{ background: "linear-gradient(135deg, #FFB88C, #FF9A56)" }}>
        <div className="bg-white/95 rounded-3xl shadow-2xl p-10 max-w-xl w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Select a Course Quiz</h2>
          {loading ? (
            <p className="text-gray-400 animate-pulse">Loading your courses...</p>
          ) : myCourses.length === 0 ? (
            <p className="text-gray-400">No completed courses yet.</p>
          ) : (
            <div className="space-y-3">
              {myCourses.map((c: any) => (
                <Link key={c._id} href={`/quiz?courseId=${c._id}`}
                  className="block w-full py-3 px-6 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition">
                  {c.title}
                </Link>
              ))}
            </div>
          )}
          <Link href="/student-dashboard" className="block mt-6 text-gray-500 hover:text-orange-500 text-sm">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #FFB88C, #FF9A56)" }}>
        <p className="text-white text-xl font-semibold">Loading quiz...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "linear-gradient(135deg, #FFB88C, #FF9A56)" }}>
        <p className="text-white text-xl">{error || "No questions available."}</p>
        <Link href="/courses" className="bg-white text-orange-500 font-semibold px-6 py-2 rounded-xl">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const scorePercentage = (score / questions.length) * 100;
  const passed = scorePercentage >= 60;
  const newLevel = scorePercentage >= 80 ? "Advanced"
    : scorePercentage >= 60 ? "Intermediate"
    : "Beginner";

  if (quizCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8"
        style={{ background: "linear-gradient(135deg, #FFB88C, #FF9A56)" }}>
        <div className="bg-white/95 rounded-3xl shadow-2xl p-12 max-w-xl w-full text-center">
          <div className="text-7xl mb-6">{passed ? "🎉" : "📚"}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Score:{" "}
            <span className={passed ? "text-green-600" : "text-orange-600"}>
              {score} / {questions.length}
            </span>
          </h1>
          <p className="text-gray-600 mb-8">
            {passed ? "Great job! You passed the quiz. Ready for the next challenge!"
              : "Don't worry! Review the material and try again."}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <div className={`h-3 rounded-full transition-all duration-1000 ${passed ? "bg-green-500" : "bg-orange-500"}`}
              style={{ width: `${scorePercentage}%` }} />
          </div>
          <p className="text-sm text-gray-500 mb-8">{Math.round(scorePercentage)}% achieved</p>

          {passed && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-3 mb-6">
              <p className="text-green-700 text-sm font-semibold">
                🎯 New Level: <strong>{newLevel}</strong>
              </p>
            </div>
          )}

          <div className="space-y-3">
            {passed ? (
              <button
                onClick={async () => {
                  try {
                    const profileRes = await api.get("/students/my-profile");
                    const profile = profileRes.data.data;

                    const courseRes = await api.get("/students/courses");
                    const allCourses = courseRes.data.courses || [];
                    const currentCourse = allCourses.find((c: any) => c._id === courseId);

                    // ✅ الـ level بحرف كبير
                    const courseLevel = currentCourse?.level
                      ? currentCourse.level.charAt(0).toUpperCase() + currentCourse.level.slice(1).toLowerCase()
                      : "Beginner";

                    // ✅ الـ category من الكورس مش من الـ profile
                    const courseCategory = currentCourse?.category || profile.interests?.[0] || "";
                    const courseSubcategory = currentCourse?.subcategory || "";

                    console.log("sending to API:", {
                      current_level: newLevel,
                      current_category: courseCategory,
                      current_subcategory: courseSubcategory,
                      exam_score: Math.round(scorePercentage),
                    });

                    const recResponse = await api.post("/api/recommendations/recommend", {
                      interests: profile.interests || [],
                      skills: profile.skills || [],
                      previous_courses: profile.history || [],
                      current_level: newLevel,
                      exam_score: Math.round(scorePercentage),
                      full_name: profile.fullName || "",
                      top_k: 6,
                      current_category: courseCategory,
                      current_subcategory: courseSubcategory,
                    });

                    const allRecs = recResponse.data.recommendations || [];
                    const filtered = allRecs.filter((rec: any) =>
                      rec._id !== courseId && rec.id !== courseId
                    );
                    
                    window.location.href = `/courses-list?level=${newLevel}&score=${Math.round(scorePercentage)}`;
                  } catch (err) {
                    console.error(err);
                    window.location.href = `/courses-list?level=${newLevel}&score=${Math.round(scorePercentage)}`;
                  }
                }}
                className="w-full bg-orange-500 text-white font-bold py-4 px-8 rounded-2xl hover:bg-orange-600 transition shadow-lg text-lg">
                🚀 View Recommended Courses
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    const key = `quiz_done_${studentId}_${courseId}`;
                    localStorage.removeItem(key);
                    setQuizCompleted(false);
                    setScore(0);
                  }}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-600 transition">
                  🔄 Retake Quiz
                </button>
                <Link href={`/course-player?courseId=${courseId}`}
                  className="block w-full bg-orange-500 text-white font-bold py-4 px-8 rounded-2xl hover:bg-orange-600 transition shadow-lg text-center text-lg">
                  Repeat Course
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "linear-gradient(135deg, #FFB88C, #FF9A56)" }}>
      <div className="w-full max-w-3xl">
        <div className="flex justify-between items-center mb-6 text-white font-semibold">
          <span className="bg-white/20 px-5 py-2 rounded-full">⏱️ {formatTime(timeLeft)}</span>
          <span className="bg-white/20 px-5 py-2 rounded-full">{currentQuestion + 1} / {questions.length}</span>
        </div>
        <div className="bg-white/95 rounded-3xl shadow-2xl p-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{questions[currentQuestion].questionText}</h2>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-4 mb-8">
            {questions[currentQuestion].options.map((option, index) => (
              <button key={index} onClick={() => setSelectedAnswer(option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                  selectedAnswer === option
                    ? "border-orange-500 bg-orange-50 font-semibold shadow-md scale-[1.02]"
                    : "border-gray-300 hover:border-orange-300 hover:bg-gray-50"
                }`}>
                {option}
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-4">
            <button onClick={handlePrevious} disabled={currentQuestion === 0}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                currentQuestion === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}>
              Previous
            </button>
            <button onClick={handleNext} disabled={selectedAnswer === null}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                selectedAnswer === null ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:shadow-xl hover:scale-105"
              }`}>
              {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizContent />
    </Suspense>
  );
}