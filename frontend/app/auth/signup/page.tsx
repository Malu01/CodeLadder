"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setToken } from "../../../lib/api";
import { Button } from "../../../components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await api.signup({ name, email, password });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setToken(res.data.access_token);
    router.push("/levels");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg" aria-label="CodeLadder home">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <img src="/header-logo.png" alt="" className="h-full w-full object-cover" />
            </div>
          </Link>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start climbing CodeLadder.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card space-y-4 p-8"
          aria-label="Signup form"
        >
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input
              id="name"
              value={name}
              autoComplete="name"
              onChange={(e) => setName(e.target.value)}
              required
              className="input"
              placeholder="e.g. Ada Lovelace"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy} disabled={busy}>
            {busy ? "Creating…" : "Sign up"}
          </Button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}