"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuizLevelDetail, QuizLevelStatus, QuizSubmitResult, api } from "../../../lib/api";
import Header from "../../../components/Header";
import { PageLoader, ErrorState } from "../../../components/ui";

const LETTERS = ["A", "B", "C", "D"];

export default function QuizLevelPage() {
  const { level } = useParams<{ level: string }>();
  const router = useRouter();
  const levelNum = Number(level);

  const [detail, setDetail] = useState<QuizLevelDetail | null>(null);
  const [status, setStatus] = useState<QuizLevelStatus | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("codeladder_token");
      if (!token) {
        router.replace("/");
        return;
      }
      const [detRes, stRes] = await Promise.all([api.quizLevel(levelNum), api.quizLevels()]);
      if (!detRes.ok) {
        setError(detRes.error);
        setLoading(false);
        return;
      }
      setDetail(detRes.data);
      setAttemptsLeft(detRes.data.attempts_left);
      if (stRes.ok) {
        setStatus(stRes.data.find((s) => s.level === levelNum) ?? null);
      }
      setLoading(false);
    })();
  }, [levelNum, router]);

  const answeredCount = useMemo(
    () => (detail ? Object.keys(answers).length : 0),
    [answers, detail]
  );
  const allAnswered = detail ? answeredCount === detail.total : false;

  const badge = result?.badge ?? status?.badge ?? false;
  const best = result != null && result.score >= (status?.best_score ?? 0) ? result.score : status?.best_score ?? 0;
  const rank = result?.rank ?? status?.rank ?? null;
  const participants = result?.participants ?? status?.participants ?? 0;

  const handleSubmit = useCallback(async () => {
    if (!detail) return;
    if (!allAnswered) {
      const remaining = detail.total - answeredCount;
      setHint(`Please answer ${remaining} more question${remaining > 1 ? "s" : ""} before submitting.`);
      return;
    }
    setHint(null);
    setSubmitting(true);
    setSubmitError(null);
    const res = await api.quizSubmit(levelNum, answers);
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.error);
      return;
    }
    setResult(res.data);
    setAttemptsLeft(res.data.attempts_left);
    requestAnimationFrame(() => {
      const el = res.data.badge ? badgeRef.current : resultRef.current;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [detail, allAnswered, answeredCount, answers, levelNum]);

  const handleRetry = () => {
    if ((result?.attempts_left ?? attemptsLeft) === 0) return;
    setAnswers({});
    setResult(null);
    setHint(null);
    setStatus((s) => (s ? { ...s, attempts: (s.attempts ?? 0) + 1, attempts_left: attemptsLeft } : s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <PageLoader />;

  if (error || !detail) {
    return (
      <div className="min-h-screen">
        <Header activeTab="quiz" />
        <ErrorState message={error || "Quiz level not found"} onBack={() => router.push("/quiz")} />
      </div>
    );
  }

  const noAttempts = attemptsLeft === 0 && !badge;
  const done = attemptsLeft === 0 && badge;
  const showQuiz = !noAttempts && !done && !result;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header activeTab="quiz" />
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
          <div className="min-w-0">
            <button
              onClick={() => router.push("/quiz")}
              className="mb-0.5 text-xs font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
            >
              ← Back to quiz
            </button>
            <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white">
              Level {detail.level} · {detail.title}
            </h1>
          </div>
          <div className="shrink-0 text-right text-sm text-slate-500 dark:text-slate-400">
            <p>{answeredCount}/{detail.total} answered</p>
            <p className="text-xs">
              {attemptsLeft} of {detail.max_attempts} attempts left
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-6 py-2">
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-valuenow={answeredCount} aria-valuemin={0} aria-valuemax={detail.total}>
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${detail.total ? (answeredCount / detail.total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {answeredCount}/{detail.total}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-6">
        {badge && (
          <div className="mb-6" ref={badgeRef}>
            <BadgePanel
              level={levelNum}
              title={detail.title}
              score={best}
              total={detail.total}
              rank={rank ?? 1}
            />
          </div>
        )}

        {result && (
          <div
            ref={resultRef}
            role="status"
            aria-live="polite"
            className={`mb-6 rounded-2xl border p-5 ${
              result.badge
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                : result.percentage >= 60
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
            }`}
          >
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {result.score}/{result.total} correct · {result.percentage}%
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {result.badge
                ? `🏆 Score ${result.score}/${result.total} (${result.percentage}%)! Your badge is unlocked — scroll to the badge above and download it.`
                : result.percentage >= 60
                ? `Good effort — you placed #${result.rank} of ${result.participants}. Score ${result.total * 0.8}/${result.total} or higher to unlock the badge.`
                : `Score of ${result.percentage}%. You placed #${result.rank} of ${result.participants}. Score ${result.total * 0.8}/${result.total} or higher to unlock the badge.`}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {result.attempts_left > 0 && (
                <button
                  onClick={handleRetry}
                  className="btn-primary px-4 py-2"
                >
                  Retry ({result.attempts_left} left)
                </button>
              )}
              <button
                onClick={() => router.push("/quiz")}
                className="btn-outline px-4 py-2"
              >
                Back to quiz
              </button>
            </div>
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            <p className="font-bold">Submission failed</p>
            <p className="mt-1">{submitError}</p>
          </div>
        )}

        {result && result.review && result.review.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              Review your answers
              <span className="text-xs font-medium text-slate-400">
                correct answers are highlighted in green
              </span>
            </h2>
            <div className="space-y-3">
              {result.review.map((rv, i) => {
                const isCorrect = rv.selected === rv.correct;
                return (
                  <div
                    key={rv.question_id}
                    className={`rounded-2xl border p-4 ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/40"
                        : "border-red-200 bg-red-50/60 dark:border-red-800 dark:bg-red-950/40"
                    }`}
                  >
                    <p className="mb-2 font-semibold text-slate-900 dark:text-white">
                      <span className={`mr-2 ${isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <span className="mr-2 text-slate-400">{i + 1}.</span>
                      {rv.question}
                    </p>
                    <ul className="space-y-1">
                      {rv.options.map((opt, oi) => {
                        const isCorrectOpt = oi === rv.correct;
                        const isSelectedOpt = oi === rv.selected;
                        return (
                          <li
                            key={oi}
                            className={`flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                              isCorrectOpt
                                ? "bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-300"
                                : isSelectedOpt
                                ? "bg-red-500/10 text-red-700 line-through dark:text-red-300"
                                : "text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            <span className="shrink-0 font-mono text-xs text-slate-400">{LETTERS[oi]}.</span>
                            <span>{opt}</span>
                            {isCorrectOpt && (
                              <span className="ml-auto shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                correct
                              </span>
                            )}
                            {isSelectedOpt && !isCorrectOpt && (
                              <span className="ml-auto shrink-0 text-xs font-bold text-red-500">your answer</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hint && (
          <p role="status" className="mb-4 text-center text-sm font-semibold text-brand-600 dark:text-brand-400">
            {hint}
          </p>
        )}

        {noAttempts ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-4xl">😢</p>
            <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">No attempts left</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              You&apos;ve used your {detail.max_attempts} attempts for this level. A score of {detail.total * 0.8}/{detail.total} or higher unlocks the badge.
            </p>
            <button
              onClick={() => router.push("/quiz")}
              className="btn-primary mt-5 px-5 py-2"
            >
              Back to quiz
            </button>
          </div>
        ) : !showQuiz ? null : (
          <>
            <div className="space-y-4">
              {detail.questions.map((q, qi) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="mb-3 font-semibold text-slate-900 dark:text-white">
                    <span className="mr-2 text-brand-600 dark:text-brand-400">{qi + 1}.</span>
                    {q.question}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => {
                          setHint(null);
                          setAnswers((a) => ({ ...a, [q.id]: oi }));
                        }}
                        aria-pressed={answers[q.id] === oi}
                        className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                          answers[q.id] === oi
                            ? "border-brand-500 bg-brand-50 text-slate-900 dark:border-brand-500 dark:bg-brand-500/10 dark:text-white"
                            : "border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-700 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            answers[q.id] === oi
                              ? "bg-brand-500 text-white"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {LETTERS[oi]}
                        </span>
                        <span className="min-w-0">{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-4 mt-6 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-elevated backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
              <p className="mr-auto text-sm text-slate-500 dark:text-slate-400">
                {answeredCount}/{detail.total} answered
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting || attemptsLeft === 0}
                className="btn-primary px-6 py-2.5"
              >
                {submitting
                  ? "Submitting…"
                  : allAnswered
                  ? "Submit answers"
                  : `Answer ${detail.total - answeredCount} more to submit`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BadgePanel(props: {
  level: number;
  title: string;
  score: number;
  total: number;
  rank: number;
  name?: string;
}) {
  const { level, title, score, total, rank, name } = props;
  const [downloading, setDownloading] = useState(false);
  const [userName, setUserName] = useState<string>(name ?? "");

  useEffect(() => {
    const n = localStorage.getItem("codeladder_name") || "";
    if (n) setUserName(n);
  }, []);

  const download = async () => {
    const svg = document.getElementById("quiz-badge-svg");
    if (!svg) return;
    setDownloading(true);
    try {
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 640, 400);
        ctx.drawImage(img, 0, 0, 640, 400);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/jpeg", 0.92);
        a.download = `codeladder-badge-level-${level}.jpg`;
        a.click();
      };
      img.src = "data:image/svg+xml;base64," + svg64;
    } finally {
      setDownloading(false);
    }
  };

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
      <svg
        id="quiz-badge-svg"
        xmlns="http://www.w3.org/2000/svg"
        width="640"
        height="400"
        viewBox="0 0 640 400"
        role="img"
      >
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
          <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <rect width="640" height="400" rx="28" fill="url(#bg)" />
        <circle cx="70" cy="300" r="90" fill="#ffffff" opacity="0.07" />
        <circle cx="570" cy="80" r="120" fill="#ffffff" opacity="0.07" />
        <circle cx="330" cy="240" r="180" fill="#000000" opacity="0.06" />
        <g transform="translate(320, 86)">
          <circle r="40" fill="url(#gold)" stroke="#ffffff" strokeWidth="4" />
          <text x="0" y="14" textAnchor="middle" fontSize="42">🏆</text>
        </g>
        <text x="320" y="176" textAnchor="middle" fontSize="20" letterSpacing="8" fill="#ffffff" opacity="0.85">CODE LADDER</text>
        <text x="320" y="222" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#ffffff">QUIZ BADGE</text>
        <rect x="220" y="238" width="200" height="34" rx="17" fill="url(#gold)" />
        <text x="320" y="261" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#7c2d12">
          LEVEL {level} · {title.toUpperCase()}
        </text>
        <text x="320" y="296" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#ffffff">{userName || "Student"}</text>
        <text x="320" y="326" textAnchor="middle" fontSize="15" fill="#ffffff" opacity="0.95">
          Score {score}/{total} · Rank #{rank} · {today}
        </text>
      </svg>
      <div className="flex shrink-0 flex-col items-center gap-2 sm:items-end">
        <button
          onClick={download}
          disabled={downloading}
          className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-600 disabled:opacity-60"
        >
          {downloading ? "Preparing…" : "⬇ Download badge (.jpg)"}
        </button>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Score {Math.round(total * 0.8)}/{total} or higher on Level {level} · {title}
        </p>
      </div>
    </div>
  );
}