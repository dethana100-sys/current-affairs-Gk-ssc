"use client";

import { useState, useEffect, useCallback } from "react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface MonthInfo {
  key: string;
  label: string;
  month: string;
  year: number;
  questionCount: number;
}

interface QuizData {
  monthLabel: string;
  questions: Question[];
  totalQuestions: number;
}

interface QuizResult {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
}

type Screen = "home" | "month-select" | "quiz" | "results";

export default function QuizApp() {
  const [screen, setScreen] = useState<Screen>("home");
  const [months, setMonths] = useState<MonthInfo[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<MonthInfo | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [shownQuestionIds, setShownQuestionIds] = useState<
    Record<string, number[]>
  >({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [filterYear, setFilterYear] = useState<number | "all">("all");

  useEffect(() => {
    fetch("/api/months")
      .then((r) => r.json())
      .then((data) => setMonths(data.months));
  }, []);

  const loadQuiz = useCallback(
    async (month: MonthInfo) => {
      setLoading(true);
      const shownIds = shownQuestionIds[month.key] || [];
      const excludeParam = shownIds.length > 0 ? `?exclude=${shownIds.join(",")}` : "";
      const res = await fetch(`/api/quiz/${month.key}${excludeParam}`);
      const data: QuizData = await res.json();
      setQuizData(data);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setResults([]);
      setScore(0);
      setShowExplanation(false);
      setScreen("quiz");
      setLoading(false);
    },
    [shownQuestionIds]
  );

  const handleMonthSelect = (month: MonthInfo) => {
    setSelectedMonth(month);
    loadQuiz(month);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    setShowExplanation(true);

    const currentQ = quizData!.questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    if (isCorrect) setScore((s) => s + 1);

    setResults((prev) => [
      ...prev,
      {
        questionId: currentQ.id,
        selectedAnswer: answerIndex,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (!quizData) return;
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
    } else {
      // Update shown question IDs
      const newShownIds = [
        ...(shownQuestionIds[selectedMonth!.key] || []),
        ...quizData.questions.map((q) => q.id),
      ];
      setShownQuestionIds((prev) => ({
        ...prev,
        [selectedMonth!.key]: newShownIds,
      }));
      setScreen("results");
    }
  };

  const handlePlayAgain = () => {
    if (selectedMonth) {
      loadQuiz(selectedMonth);
    }
  };

  const handleBackToMonths = () => {
    setScreen("month-select");
    setQuizData(null);
    setResults([]);
  };

  const handleBackToHome = () => {
    setScreen("home");
    setSelectedMonth(null);
    setQuizData(null);
  };

  const years = ["all", 2025, 2026] as const;
  const filteredMonths =
    filterYear === "all" ? months : months.filter((m) => m.year === filterYear);

  const getOptionStyle = (index: number) => {
    if (!isAnswered) {
      return "bg-white border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700";
    }
    const currentQ = quizData!.questions[currentQuestionIndex];
    if (index === currentQ.correctAnswer) {
      return "bg-emerald-50 border-2 border-emerald-500 text-emerald-800";
    }
    if (index === selectedAnswer && index !== currentQ.correctAnswer) {
      return "bg-red-50 border-2 border-red-500 text-red-800";
    }
    return "bg-slate-50 border-2 border-slate-200 text-slate-400";
  };

  const getOptionIcon = (index: number) => {
    if (!isAnswered) return null;
    const currentQ = quizData!.questions[currentQuestionIndex];
    if (index === currentQ.correctAnswer) {
      return (
        <span className="ml-auto text-emerald-600 text-lg font-bold">✓</span>
      );
    }
    if (index === selectedAnswer && index !== currentQ.correctAnswer) {
      return <span className="ml-auto text-red-600 text-lg font-bold">✗</span>;
    }
    return null;
  };

  const optionLetters = ["A", "B", "C", "D"];

  // HOME SCREEN
  if (screen === "home") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-2xl w-full animate-fade-in">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
              <span className="text-4xl">🇮🇳</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            India Current Affairs
          </h1>
          <p className="text-xl text-indigo-200 mb-2 font-medium">
            Monthly Quiz Challenge
          </p>
          <p className="text-indigo-300 mb-10 text-sm">
            January 2025 – July 2026 • 5 Random Questions Per Round
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              {
                icon: "📅",
                title: "19 Months",
                desc: "Jan 2025 – Jul 2026",
              },
              {
                icon: "❓",
                title: "570+ Questions",
                desc: "30+ per month",
              },
              {
                icon: "🔀",
                title: "Random Sets",
                desc: "New questions every round",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-white font-bold text-lg">{item.title}</div>
                <div className="text-indigo-300 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setScreen("month-select")}
            className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-xl px-12 py-5 rounded-2xl shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-200 pulse-glow"
          >
            Start Quiz →
          </button>

          <p className="text-indigo-400 text-xs mt-6">
            Test your knowledge of India&apos;s most important current affairs
          </p>
        </div>
      </div>
    );
  }

  // MONTH SELECTION SCREEN
  if (screen === "month-select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 animate-fade-in">
            <button
              onClick={handleBackToHome}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              ←
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                Select a Month
              </h2>
              <p className="text-indigo-300 text-sm">
                Choose any month to start the quiz
              </p>
            </div>
          </div>

          {/* Year Filter */}
          <div className="flex gap-2 mb-6 animate-fade-in">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setFilterYear(year)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  filterYear === year
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                    : "bg-white/10 text-indigo-200 hover:bg-white/20"
                }`}
              >
                {year === "all" ? "All Years" : year}
              </button>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredMonths.map((month, idx) => {
              const shownCount = (shownQuestionIds[month.key] || []).length;
              const progress = Math.min(
                100,
                Math.round((shownCount / month.questionCount) * 100)
              );

              const monthColors: Record<string, string> = {
                January: "from-blue-500 to-cyan-500",
                February: "from-pink-500 to-rose-500",
                March: "from-green-500 to-emerald-500",
                April: "from-purple-500 to-violet-500",
                May: "from-yellow-500 to-amber-500",
                June: "from-orange-500 to-red-500",
                July: "from-teal-500 to-cyan-500",
                August: "from-indigo-500 to-blue-500",
                September: "from-rose-500 to-pink-500",
                October: "from-amber-500 to-orange-500",
                November: "from-violet-500 to-purple-500",
                December: "from-sky-500 to-blue-500",
              };

              const colorClass =
                monthColors[month.month] || "from-indigo-500 to-purple-500";

              return (
                <button
                  key={month.key}
                  onClick={() => handleMonthSelect(month)}
                  className="group relative bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-4 text-left transition-all duration-200 hover:scale-105 active:scale-95 animate-fade-in"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-lg mb-3 shadow-lg`}
                  >
                    📅
                  </div>
                  <div className="text-white font-bold text-sm leading-tight">
                    {month.month}
                  </div>
                  <div className="text-indigo-300 text-xs mb-3">
                    {month.year}
                  </div>
                  <div className="text-indigo-200 text-xs mb-2">
                    {month.questionCount} questions
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-indigo-400 mt-1">
                    {progress > 0 ? `${progress}% explored` : "Not started"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // QUIZ SCREEN
  if (screen === "quiz") {
    if (loading || !quizData) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-300 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <p className="text-indigo-200 text-lg">Loading questions...</p>
          </div>
        </div>
      );
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const progress =
      ((currentQuestionIndex + (isAnswered ? 1 : 0)) / quizData.questions.length) *
      100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-6 flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <button
              onClick={handleBackToMonths}
              className="flex items-center gap-2 text-indigo-300 hover:text-white transition-colors text-sm font-medium"
            >
              ← Back
            </button>
            <div className="text-center">
              <div className="text-white font-bold text-sm">
                {quizData.monthLabel}
              </div>
              <div className="text-indigo-300 text-xs">
                Question {currentQuestionIndex + 1} of {quizData.questions.length}
              </div>
            </div>
            <div className="bg-indigo-500/30 border border-indigo-400/50 rounded-xl px-3 py-1">
              <span className="text-amber-300 font-bold text-sm">
                {score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 mb-6">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question Card */}
          <div
            key={currentQuestionIndex}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 md:p-8 mb-4 animate-scale-in"
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
                Q
              </div>
              <p className="text-white text-lg md:text-xl font-semibold leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isAnswered}
                  className={`option-btn w-full flex items-center gap-3 p-4 rounded-2xl text-left font-medium transition-all cursor-pointer disabled:cursor-default ${getOptionStyle(index)}`}
                >
                  <span className="w-8 h-8 rounded-xl bg-current/10 flex items-center justify-center text-sm font-bold flex-shrink-0 opacity-60">
                    {optionLetters[index]}
                  </span>
                  <span className="flex-1 text-sm md:text-base">{option}</span>
                  {getOptionIcon(index)}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="bg-indigo-900/50 border border-indigo-500/40 rounded-2xl p-4 mb-4 animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <span className="text-indigo-300 font-semibold text-sm">
                  Explanation
                </span>
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-fade-in"
            >
              {currentQuestionIndex < quizData.questions.length - 1
                ? "Next Question →"
                : "View Results 🎯"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // RESULTS SCREEN
  if (screen === "results") {
    const percentage = Math.round(
      (score / (quizData?.questions.length || 5)) * 100
    );

    const getScoreEmoji = () => {
      if (percentage >= 80) return "🏆";
      if (percentage >= 60) return "🌟";
      if (percentage >= 40) return "👍";
      return "📚";
    };

    const getScoreMessage = () => {
      if (percentage >= 80) return "Excellent! You're a current affairs expert!";
      if (percentage >= 60) return "Great job! Keep up the good work!";
      if (percentage >= 40) return "Good effort! Keep practising!";
      return "Keep learning! You'll improve!";
    };

    const getScoreColor = () => {
      if (percentage >= 80) return "from-emerald-400 to-green-500";
      if (percentage >= 60) return "from-amber-400 to-yellow-500";
      if (percentage >= 40) return "from-blue-400 to-indigo-500";
      return "from-rose-400 to-red-500";
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 md:p-6 flex flex-col">
        <div className="max-w-2xl mx-auto w-full">
          {/* Score Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 mb-6 text-center animate-scale-in">
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
            <h2 className="text-3xl font-black text-white mb-2">
              Quiz Complete!
            </h2>
            <p className="text-indigo-300 mb-6">{selectedMonth?.label}</p>

            <div
              className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor()} shadow-2xl mb-4`}
            >
              <div className="text-center">
                <div className="text-4xl font-black text-white">{score}</div>
                <div className="text-white/80 text-xs">
                  of {quizData?.questions.length}
                </div>
              </div>
            </div>

            <div className="text-2xl font-bold text-white mb-2">
              {percentage}%
            </div>
            <p className="text-indigo-200 text-sm">{getScoreMessage()}</p>
          </div>

          {/* Question Review */}
          <div className="bg-white/10 border border-white/20 rounded-3xl p-6 mb-6 animate-fade-in">
            <h3 className="text-white font-bold mb-4 text-lg">
              Review Answers
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin pr-2">
              {quizData?.questions.map((q, idx) => {
                const result = results[idx];
                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl p-4 border ${
                      result?.isCorrect
                        ? "bg-emerald-900/30 border-emerald-500/40"
                        : "bg-red-900/30 border-red-500/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {result?.isCorrect ? "✅" : "❌"}
                      </span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium mb-2 leading-relaxed">
                          {q.question}
                        </p>
                        {!result?.isCorrect && (
                          <div className="space-y-1">
                            <p className="text-red-300 text-xs">
                              Your answer:{" "}
                              <span className="font-medium">
                                {q.options[result?.selectedAnswer]}
                              </span>
                            </p>
                            <p className="text-emerald-300 text-xs">
                              Correct:{" "}
                              <span className="font-medium">
                                {q.options[q.correctAnswer]}
                              </span>
                            </p>
                          </div>
                        )}
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <button
              onClick={handlePlayAgain}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              🔀 New Set
            </button>
            <button
              onClick={handleBackToMonths}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              📅 Months
            </button>
          </div>

          <button
            onClick={handleBackToHome}
            className="w-full mt-3 text-indigo-400 hover:text-white text-sm transition-colors py-2"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
