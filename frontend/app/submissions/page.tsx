"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SubmissionRow, api } from "../../lib/api";
import Header from "../../components/Header";
import { PageLoader, ErrorState, EmptyState } from "../../components/ui";

const STATUS_STYLES: Record<string, string> = {
  accepted: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  wrong: "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  error: "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  timeout: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
};

export default function SubmissionsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const PAGE = 25;

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("codeladder_token");
      if (!token) {
        router.replace("/");
        return;
      }
      const res = await api.mySubmissions({ limit: PAGE });
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setRows(res.data);
      setHasMore(res.data.length === PAGE);
      setLoading(false);
    })();
  }, [router]);

  async function loadMore() {
    if (rows.length === 0) return;
    const last = rows[rows.length - 1];
    const before = last.created_at
      ? new Date(last.created_at).getTime() / 1000
      : undefined;
    setLoadingMore(true);
    const res = await api.mySubmissions({ limit: PAGE, before });
    setLoadingMore(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setRows((prev) => [...prev, ...res.data]);
    setHasMore(res.data.length === PAGE);
  }

  if (loading) return <PageLoader />;
  if (error)
    return (
      <div className="min-h-screen">
        <Header activeTab="history" />
        <ErrorState message={error} onBack={() => router.push("/levels")} />
      </div>
    );

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    return sameDay
      ? `Today, ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
      : d.toLocaleString();
  }

  return (
    <div className="min-h-screen">
      <Header activeTab="history" />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="page-title">Submission History</h1>
          <p className="page-subtitle">Your recent attempts, newest first.</p>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon="🚀"
            title="No submissions yet"
            body="Head to a challenge and press Submit to record your first attempt."
            action={
              <button onClick={() => router.push("/levels")} className="btn-primary">
                Browse challenges
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <th scope="col" className="px-4 py-3 font-semibold">Challenge</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Tests</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Runtime</th>
                    <th scope="col" className="px-4 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/challenge/${r.challenge_id}`)}
                          className="font-medium text-slate-700 underline-offset-2 hover:text-brand-600 hover:underline dark:text-slate-200 dark:hover:text-brand-400"
                        >
                          {r.challenge_title}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip capitalize ${STATUS_STYLES[r.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-200">
                        {r.tests_passed}/{r.tests_total}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-200">
                        {r.runtime_ms} ms
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn-outline mt-4 w-full"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}