"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/services/api";
import { FinalQuizNavbar, QuizDetails, AddQuestionButton, QuizActions } from "@/components/final-quiz";
import { durationOptions } from "@/data/finalQuiz";

interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface QuestionModalProps {
  question: Question | null;
  onSave: (q: Question) => void;
  onClose: () => void;
}

// ✅ Modal لإضافة/تعديل سؤال
function QuestionModal({ question, onSave, onClose }: QuestionModalProps) {
  const [questionText, setQuestionText] = useState(question?.questionText || "");
  const [options, setOptions] = useState<string[]>(question?.options || ["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correctAnswer || "");
  const [error, setError] = useState("");

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
    if (correctAnswer === options[index]) setCorrectAnswer(value);
  };

  const handleSave = () => {
    if (!questionText.trim()) return setError("Please enter a question.");
    if (options.some(o => !o.trim())) return setError("Please fill all options.");
    if (!correctAnswer) return setError("Please select the correct answer.");
    onSave({
      id: question?.id || Date.now(),
      questionText: questionText.trim(),
      options: options.map(o => o.trim()),
      correctAnswer: correctAnswer.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {question ? "Edit Question" : "Add Question"}
        </h2>

        {/* Question Text */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700 mb-1 block">Question</label>
          <input
            type="text"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
            placeholder="Enter question..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-300 text-sm"
          />
        </div>

        {/* Options */}
        <div className="mb-4 space-y-2">
          <label className="text-sm font-semibold text-gray-700 block">Options</label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="radio"
                name="correct"
                checked={correctAnswer === opt && opt !== ""}
                onChange={() => setCorrectAnswer(opt)}
                className="accent-orange-500 w-4 h-4 flex-shrink-0"
              />
              <input
                type="text"
                value={opt}
                onChange={e => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-300 text-sm"
              />
            </div>
          ))}
          <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex gap-3 justify-end mt-4">
          <button onClick={onClose}
            className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">
            Save Question
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinalQuiz() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ✅ Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // ✅ جيب الأسئلة الموجودة
  useEffect(() => {
    if (courseId) {
      const fetchExam = async () => {
        try {
          const response = await api.get(`/instructor/course-exam/${courseId}`);
          const exam = response.data.exam;
          if (exam?.questions?.length > 0) {
            setQuestions(
              exam.questions.map((q: any, i: number) => ({
                id: i + 1,
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer,
              }))
            );
          }
        } catch (err) {
          console.error("Error fetching exam:", err);
        }
      };
      fetchExam();
    }
  }, [courseId]);

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleEditQuestion = (id: number) => {
    const q = questions.find(q => q.id === id);
    if (q) {
      setEditingQuestion(q);
      setShowModal(true);
    }
  };

  const handleModalSave = (savedQ: Question) => {
    if (editingQuestion) {
      setQuestions(questions.map(q => q.id === savedQ.id ? savedQ : q));
    } else {
      setQuestions([...questions, { ...savedQ, id: questions.length + 1 }]);
    }
    setShowModal(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure? All changes will be lost.")) {
      window.location.href = "/course-builder";
    }
  };

  const handleSave = async () => {
    if (!courseId) return setErrorMsg("No course selected.");
    if (questions.length === 0) return setErrorMsg("Please add at least one question.");

    setSaving(true);
    setErrorMsg(null);
    setSaveMsg(null);

    try {
      await api.put(`/instructor/update-course/${courseId}`, {
        exam: {
          questions: questions.map(q => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
          })),
          totalScore: 100,
        },
      });
      setSaveMsg("Quiz saved successfully! ✅");
      setTimeout(() => window.location.href = "/courses-management", 1500);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFD9B8, #FFE6C5)" }}>
      <FinalQuizNavbar />

      {/* ✅ Modal */}
      {showModal && (
        <QuestionModal
          question={editingQuestion}
          onSave={handleModalSave}
          onClose={() => { setShowModal(false); setEditingQuestion(null); }}
        />
      )}

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-6">Add Quiz</h1>

        {!courseId && (
          <div className="bg-orange-100 border border-orange-300 text-orange-700 rounded-xl p-4 mb-6 text-center text-sm">
            ⚠️ No course selected. Go to{" "}
            <a href="/courses-management" className="underline font-semibold">Courses Management</a>{" "}
            and edit a course first.
          </div>
        )}

        <QuizDetails
          date={date}
          onDateChange={setDate}
          duration={duration}
          onDurationChange={setDuration}
          durations={durationOptions}
        />

        {/* ✅ Questions List */}
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id}
              className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-orange-400">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-base flex-1 pr-4">
                  {index + 1}. {q.questionText}
                </h3>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEditQuestion(q.id)}
                    className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                    ✏️
                  </button>
                  <button onClick={() => handleDeleteQuestion(q.id)}
                    className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center hover:bg-red-600 transition">
                    <span className="text-white text-sm">🗑</span>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <div key={i}
                    className={`px-4 py-2.5 rounded-xl text-sm border transition-all ${
                      opt === q.correctAnswer
                        ? "bg-green-50 border-green-300 text-green-700 font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-700"
                    }`}>
                    {opt === q.correctAnswer && <span className="mr-2">✅</span>}
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <AddQuestionButton onClick={handleAddQuestion} />
        </div>

        {saveMsg && <p className="text-green-600 text-sm font-medium mt-4 text-center">{saveMsg}</p>}
        {errorMsg && <p className="text-red-500 text-sm font-medium mt-4 text-center">{errorMsg}</p>}

        <QuizActions
          onCancel={handleCancel}
          onSave={saving ? () => {} : handleSave}
        />

        {saving && <p className="text-center text-gray-500 text-sm mt-2 animate-pulse">Saving...</p>}
      </main>
    </div>
  );
}