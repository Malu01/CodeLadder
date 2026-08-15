const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const TOKEN_KEY = "codeladder_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export type Level = {
  id: number;
  position: number;
  title: string;
  description: string;
  band: string;
  difficulty: string;
  unlocked: boolean;
  solved_count: number;
  challenges: {
    id: number;
    title: string;
    position: number;
    points: number;
    solved: boolean;
  }[];
};

export type Challenge = {
  id: number;
  title: string;
  level_id: number;
  position: number;
  statement: string;
  input_format: string;
  output_format: string;
  starter_code: string;
  points: number;
  solved: boolean;
};

export type TestResult = {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
};

export type RunResponse = {
  results: TestResult[];
  all_passed: boolean;
  runtime_ms: number;
  error: string | null;
};

export type SubmitResponse = {
  status: "accepted" | "wrong" | "error" | "timeout";
  tests_passed: number;
  tests_total: number;
  runtime_ms: number;
  error: string | null;
  xp_awarded: number;
  message: string;
  level_completed?: boolean;
  level_position?: number | null;
  level_title?: string | null;
  coins?: number | null;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  xp: number;
  solved_challenges: number;
  current_level: number;
};

export type SubmissionRow = {
  id: number;
  challenge_id: number;
  challenge_title: string;
  status: "accepted" | "wrong" | "error" | "timeout";
  runtime_ms: number;
  tests_passed: number;
  tests_total: number;
  created_at: string;
};

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true
): Promise<Result<T>> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const token = attempt === 0 ? getToken() : await refreshIdToken();
    if (auth && token) headers.Authorization = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      // Network-level failure (server down, offline, connection reset).
      return { ok: false, error: "Cannot reach the server. Is the backend running?" };
    }

    if (res.status === 401 && auth && attempt === 0) {
      continue; // token expired → refresh once and retry
    }

    let data: any = null;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const detail =
        typeof data?.detail === "string"
          ? data.detail
          : Array.isArray(data?.detail)
          ? data.detail.map((d: any) => d.msg).join("; ")
          : "Something went wrong";
      return { ok: false, error: detail || `HTTP ${res.status}` };
    }
    return { ok: true, data: data as T };
  }
  return { ok: false, error: "Session expired. Please log in again." };
}

async function refreshIdToken(): Promise<string | null> {
  try {
    const { auth } = await import("./firebase-auth");
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken(true);
    setToken(token);
    return token;
  } catch {
    return null;
  }
}

export type XpPoint = {
  xp: number;
  ts: string;
};

export type Me = {
  id: string;
  name: string;
  email: string;
  xp: number;
  current_level: number;
  solved_challenges: number;
  submission_count: number;
  rank: number;
  streak: number;
  xp_history: XpPoint[];
  coins: number;
  completed_levels: Record<string, { completed_at: string; title: string }>;
};

type AuthResult = { ok: true; data: { access_token: string } } | { ok: false; error: string };

export type QuizLevelStatus = {
  level: number;
  title: string;
  description: string;
  total: number;
  attempts: number;
  attempts_left: number;
  best_score: number;
  badge: boolean;
  rank: number | null;
  participants: number;
};

export type QuizQuestion = { id: number; question: string; options: string[] };

export type QuizLevelDetail = {
  level: number;
  title: string;
  description: string;
  total: number;
  attempts_left: number;
  max_attempts: number;
  questions: QuizQuestion[];
};

export type QuizReviewItem = {
  question_id: number;
  question: string;
  options: string[];
  selected: number | null;
  correct: number;
};

export type QuizSubmitResult = {
  level: number;
  title: string;
  score: number;
  total: number;
  percentage: number;
  attempts: number;
  attempts_left: number;
  badge: boolean;
  rank: number;
  participants: number;
  review?: QuizReviewItem[];
};

export const api = {
  signup: async (body: { name: string; email: string; password: string }): Promise<AuthResult> => {
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const { auth } = await import("./firebase-auth");
      const cred = await createUserWithEmailAndPassword(auth, body.email, body.password);
      await updateProfile(cred.user, { displayName: body.name });
      const token = await cred.user.getIdToken();
      return { ok: true, data: { access_token: token } };
    } catch (e: any) {
      return { ok: false, error: e?.code ? friendlyAuthError(e.code) : String(e?.message ?? e) };
    }
  },
  login: async (body: { email: string; password: string }): Promise<AuthResult> => {
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("./firebase-auth");
      const cred = await signInWithEmailAndPassword(auth, body.email, body.password);
      const token = await cred.user.getIdToken();
      return { ok: true, data: { access_token: token } };
    } catch (e: any) {
      return { ok: false, error: e?.code ? friendlyAuthError(e.code) : String(e?.message ?? e) };
    }
  },
  loginWithGoogle: async (): Promise<AuthResult> => {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { auth } = await import("./firebase-auth");
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const token = await cred.user.getIdToken();
      return { ok: true, data: { access_token: token } };
    } catch (e: any) {
      if (e?.code === "auth/popup-closed-by-user") {
        return { ok: false, error: "Sign-in popup was closed before completing." };
      }
      return { ok: false, error: e?.code ? friendlyAuthError(e.code) : String(e?.message ?? e) };
    }
  },
  me: () => request<Me>("GET", "/auth/me"),
  updateName: (name: string) => request<Me>("PATCH", "/auth/me", { name }),
  levels: () => request<Level[]>("GET", "/levels"),
  challenge: (id: number) => request<Challenge>("GET", `/levels/${id}`),
  run: (challenge_id: number, code: string) =>
    request<RunResponse>("POST", `/challenges/${challenge_id}/run`, { challenge_id, code }),
  submit: (challenge_id: number, code: string) =>
    request<SubmitResponse>("POST", `/challenges/${challenge_id}/submit`, { challenge_id, code }),
  leaderboard: () => request<LeaderboardEntry[]>("GET", "/leaderboard"),
  mySubmissions: (params?: { limit?: number; before?: number }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.before) qs.set("before", String(params.before));
    const q = qs.toString();
    return request<SubmissionRow[]>("GET", `/submissions/me${q ? `?${q}` : ""}`);
  },
  quizLevels: () => request<QuizLevelStatus[]>("GET", "/quiz/levels"),
  quizLevel: (level: number) => request<QuizLevelDetail>("GET", `/quiz/levels/${level}`),
  quizSubmit: (level: number, answers: Record<number, number>) =>
    request<QuizSubmitResult>("POST", `/quiz/levels/${level}/submit`, { answers }),
};

function friendlyAuthError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
  };
  return map[code] ?? "Authentication failed. Please try again.";
}