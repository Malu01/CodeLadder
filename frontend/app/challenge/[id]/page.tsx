"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Challenge,
  RunResponse,
  SubmitResponse,
  api,
} from "../../../lib/api";
import Header from "../../../components/Header";
import Markdown from "../../../components/Markdown";
import { PageLoader, ErrorState } from "../../../components/ui";
import { clearDraft, loadDraft, saveDraft } from "../../../lib/draft";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const challengeId = Number(id);

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<RunResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<SubmitResponse | null>(null);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("codeladder_token");
      if (!token) {
        router.replace("/");
        return;
      }
      const res = await api.challenge(challengeId);
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setChallenge(res.data);
      const draft = loadDraft(challengeId);
      setCode(draft?.code ?? res.data.starter_code);
      if (draft) {
        if (draft.runResult) setRunResult(draft.runResult as RunResponse);
        if (draft.submitResult) setSubmitResult(draft.submitResult as SubmitResponse);
      }
      setLoading(false);
    })();
  }, [challengeId, router]);

  // Autosave code + results as they change (skips the initial starter-code set).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (!challenge) return;
    saveDraft(challengeId, { code, runResult, submitResult });
  }, [code, runResult, submitResult, challenge, challengeId]);

  async function handleRun() {
    setRunning(true);
    setSubmitResult(null);
    setSubmitError(null);
    const res = await api.run(challengeId, code);
    setRunning(false);
    if (!res.ok) {
      setRunResult(null);
      setSubmitResult({
        status: "error",
        tests_passed: 0,
        tests_total: 0,
        runtime_ms: 0,
        error: res.error,
        xp_awarded: 0,
        message: res.error,
      });
      return;
    }
    setRunResult(res.data);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const res = await api.submit(challengeId, code);
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.error);
      return;
    }
    setSubmitResult(res.data);
    setRunResult(null);
    if (res.data.status === "accepted") {
      // Solved — keep the badge shown and no draft needed.
      setChallenge((c) => (c ? { ...c, solved: true } : c));
      clearDraft(challengeId);
      if (res.data.level_completed) {
        setCelebration(res.data);
      }
    }
  }

  function handleReset() {
    if (!challenge) return;
    clearDraft(challengeId);
    setCode(challenge.starter_code);
    setRunResult(null);
    setSubmitResult(null);
  }

  if (loading) return <PageLoader />;

  if (error || !challenge)
    return (
      <div className="min-h-screen">
        <Header activeTab="prepare" />
        <ErrorState message={error || "Challenge not found"} onBack={() => router.push("/levels")} />
      </div>
    );

  const statusColors: Record<string, string> = {
    accepted: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    wrong: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    error: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
    timeout: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Header activeTab="prepare" />
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="min-w-0">
            <button
              onClick={() => router.push("/levels")}
              className="mb-0.5 text-xs font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400"
            >
              ← Back to challenges
            </button>
            <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white">{challenge.title}</h1>
            {challenge.solved && (
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
                ✓ Solved
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={handleRun}
              disabled={running || submitting}
              className="btn-outline px-5 py-2"
            >
              {running ? "Running…" : "Run"}
            </button>
            {challenge.solved ? (
              <button
                disabled
                className="btn cursor-default bg-emerald-500/15 px-5 py-2 text-emerald-600 dark:text-emerald-400"
              >
                ✓ Solved
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={running || submitting}
                className="btn-primary px-5 py-2"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-6 py-6 lg:grid-cols-2">
        {/* Left: problem */}
        <div className="space-y-5 overflow-y-auto">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Problem</h2>
            <Markdown text={challenge.statement} />
          </section>

          {challenge.input_format && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">Input</h3>
              <p className="whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">{challenge.input_format}</p>
            </section>
          )}

          {challenge.output_format && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">Output</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{challenge.output_format}</p>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-1 text-sm font-bold text-slate-700 dark:text-slate-300">Points</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{challenge.points} XP</p>
          </section>
        </div>

        {/* Right: editor + results */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-700">
              <span className="h-3 w-3 rounded-full bg-red-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" aria-hidden="true" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="ml-3 font-mono text-xs text-slate-500 dark:text-slate-400">main.py</span>
              <button
                onClick={handleReset}
                title="Reset to starter code and clear saved draft"
                className="btn-ghost ml-auto px-2 py-1 text-xs"
              >
                Reset draft
              </button>
            </div>
            <div className="h-[440px]">
              <Editor
                language="python"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value ?? "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  tabSize: 4,
                  insertSpaces: true,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 12 },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Results panel */}
          {(runResult || submitResult || submitError) && (
            <div role="status" aria-live="polite" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
              {submitError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                  <p className="font-bold">Submission failed</p>
                  <p>{submitError}</p>
                </div>
              )}
              {submitResult && (
                <div
                  className={`mb-4 rounded-xl border p-4 ${statusColors[submitResult.status] ?? ""}`}
                >
                  <p className="font-bold capitalize">{submitResult.status}</p>
                  <p className="text-sm">{submitResult.message}</p>
                  <p className="mt-1 text-sm opacity-80">
                    {submitResult.tests_passed}/{submitResult.tests_total} tests passed ·{" "}
                    {submitResult.runtime_ms} ms
                    {submitResult.xp_awarded > 0 && (
                      <span className="font-semibold"> · +{submitResult.xp_awarded} XP</span>
                    )}
                  </p>
                  {submitResult.error && (
                    <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-2 text-xs text-red-300">
                      {submitResult.error}
                    </pre>
                  )}
                </div>
              )}

              {runResult && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Sample tests — {runResult.results.filter((r) => r.passed).length}/
                    {runResult.results.length} passed
                  </p>
                  {runResult.results.map((r, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                      <p
                        className={`mb-1 text-sm font-semibold ${
                          r.passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {r.passed ? "✓" : "✗"} Test {i + 1}
                      </p>
                      <div className="grid gap-2 text-xs font-mono sm:grid-cols-3">
                        <div>
                          <p className="text-slate-400 dark:text-slate-500">Input</p>
                          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                            {r.input || "(none)"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500">Expected</p>
                          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                            {r.expected || "(empty)"}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 dark:text-slate-500">Actual</p>
                          <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                            {r.actual || "(empty)"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {celebration && (
        <LevelCompletePopup
          levelPosition={celebration.level_position ?? 0}
          levelTitle={celebration.level_title ?? ""}
          coins={celebration.coins ?? 1}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
}

function LevelCompletePopup({
  levelPosition,
  levelTitle,
  coins,
  onClose,
}: {
  levelPosition: number;
  levelTitle: string;
  coins: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-200 bg-white p-6 shadow-2xl dark:border-emerald-700/60 dark:bg-slate-800">
        <div className="mb-3 flex items-start justify-between">
          <div className="text-5xl">🎉</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full px-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <h2 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
          Level {levelPosition} Complete! 🏆
        </h2>
        <p className="mt-1 text-lg font-semibold text-slate-700 dark:text-slate-200">
          {levelTitle}
        </p>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/30">
          <span className="text-4xl">🪙</span>
          <div>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              +{coins} coin{coins > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You cleared every challenge in this level!
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-2">
          <LevelBadgePanel level={levelPosition} title={levelTitle} />
        </div>

        <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
          >
            Continue ({coins} coin 🪙)
          </button>
        </div>
      </div>
    </div>
  );
}

function LevelBadgePanel({
  level,
  title,
}: {
  level: number;
  title: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const n = localStorage.getItem("codeladder_name") || "";
    if (n) setUserName(n);
  }, []);

  const download = async () => {
    const svg = document.getElementById("level-badge-svg");
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
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full overflow-hidden rounded-xl shadow-md">
        <svg
          id="level-badge-svg"
          xmlns="http://www.w3.org/2000/svg"
          width="640"
          height="400"
          viewBox="0 0 640 400"
          role="img"
          className="h-auto w-full"
        >
          <defs>
            <linearGradient id="lvl-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="lvl-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect width="640" height="400" rx="28" fill="url(#lvl-bg)" />
          <circle cx="70" cy="300" r="90" fill="#ffffff" opacity="0.08" />
          <circle cx="570" cy="80" r="120" fill="#ffffff" opacity="0.08" />
          <circle cx="330" cy="240" r="180" fill="#000000" opacity="0.06" />
          <g transform="translate(320, 92)">
            <circle r="42" fill="url(#lvl-gold)" stroke="#ffffff" strokeWidth="4" />
            <text x="0" y="15" textAnchor="middle" fontSize="44">
              🏆
            </text>
          </g>
          <text
            x="320"
            y="185"
            textAnchor="middle"
            fontSize="46"
            fontWeight="800"
            fill="#ffffff"
          >
            LEVEL {level}
          </text>
          <text
            x="320"
            y="228"
            textAnchor="middle"
            fontSize="26"
            fontWeight="600"
            fill="#d1fae5"
          >
            {title || "CodeLadder"}
          </text>
          <text
            x="320"
            y="275"
            textAnchor="middle"
            fontSize="22"
            fill="#ffffff"
          >
            {userName || "CodeLadder"} — Completed!
          </text>
          <rect
            x="220"
            y="305"
            width="200"
            height="34"
            rx="17"
            fill="#ffffff"
            opacity="0.15"
          />
          <text
            x="320"
            y="328"
            textAnchor="middle"
            fontSize="18"
            fill="#ffffff"
          >
            🪙 +1 coin · {today}
          </text>
        </svg>
      </div>
      <button
        onClick={download}
        disabled={downloading}
        className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60 dark:border-emerald-700 dark:bg-slate-700 dark:text-emerald-300 dark:hover:bg-slate-600"
      >
        {downloading ? "Preparing…" : "⬇ Download badge (.jpg)"}
      </button>
    </div>
  );
}
