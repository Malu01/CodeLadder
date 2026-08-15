# CodeLadder 🪜

A HackerRank-style coding practice platform where students climb **levels**, one
challenge at a time. Write Python in a full **Monaco editor** (syntax
highlighting + linting), hit **Run** to test against sample cases, then
**Submit** to be graded against hidden test cases. Pass all challenges in a
level to unlock the next — and track your progress on the leaderboard and
submission history pages.

> Frontend: React / Next.js 14 (App Router + Tailwind)
> Backend: FastAPI + a sandboxed Python code runner
> DB + Auth: Firebase (Cloud Firestore + Firebase Auth)

---

## Quick start

You'll need a Firebase project first (see `SETUP-FIREBASE.md`). It provides:
- **Firestore** — the database (users, levels, challenges, submissions)
- **Firebase Auth** — email/password signup & login
- a **service account** JSON for the backend (Admin SDK)
- web app config for the frontend SDK

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows (PowerShell)
pip install -r requirements.txt
copy .env.example .env            # then fill in Firebase values
# Save your service account as backend/serviceAccount.json
uvicorn app.main:app --reload --port 8001
```

The first startup seeds the curriculum into Firestore (30 levels across
Beginner → Mythic, 64 challenges; seeding is idempotent). API docs at
`http://localhost:8001/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Fill the `NEXT_PUBLIC_FIREBASE_*` values in
`frontend/.env.local` from the Firebase console, and set
`NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1`.

## How it works

| Piece | What it does |
|---|---|
| Firebase Auth (client) | Signup / login in the browser → Firebase ID token |
| `GET /api/v1/auth/me` | Who am I (verifies the Firebase ID token via Admin SDK) |
| `GET /api/v1/levels` | Levels + challenges with solved/unlocked state |
| `POST /challenges/{id}/run` | Runs your code on the challenge's **sample** tests |
| `POST /challenges/{id}/submit` | Runs on **hidden** tests, stores a submission, awards XP once |
| `GET /api/v1/leaderboard` | Top 25 climbers by XP |
| `GET /api/v1/submissions/me` | Your last 100 submissions, newest first |

### The code runner (`backend/app/runner.py`)

- Writes the student's code to a temp dir, executes it via a real `python`
  subprocess with the test input piped to stdin.
- Enforces a **hard timeout** (`RUNNER_TIMEOUT_SECONDS`) and an address-space
  memory cap (`RUNNER_MEMORY_MB`, POSIX `resource` limits).
- Compares the program's stdout against the expected output per test case.
- Returns `accepted | wrong | timeout | error` with per-test details.

**Security note (important for production):** this is process-level
isolation — a malicious program could in principle do system calls, read files,
or spam sockets. Fine for a class / trusted-adjacent pool of students. Before a
public launch, move execution to gVisor/Firecracker microVMs with seccomp,
per-submission containers, network disabled + CPU quota.

## Curriculum (seeded)

| Level | Band / Difficulty | Title | Challenges |
|---|---|---|---|
| 1 | Beginner · Easy | Warm-Up | Hello World · Sum of Two Numbers · Even or Odd |
| 2 | Beginner · Easy | Conditions & Logic | Grade the Score · Largest of Three |
| 3 | Intermediate · Medium | Loops | Countdown · Sum 1 to N · FizzBuzz |
| 4 | Intermediate · Medium | Strings | Reverse a String · Count Vowels · Palindrome Check |
| 5 | Advanced · Hard | Intro Arrays | Sum of a List · Find the Maximum · Two Sum |
| 6 | Advanced · Hard | Recursion & Fibonacci | Fibonacci (recursive) · Sum of Digits |
| 7 | Advanced · Hard | Dictionaries & Sets | Character Frequency · Unique Elements |
| 8 | Advanced · Hard | Sorting & Searching | Sort the List · Find the Position |
| 9 | Expert · Hard | Matrices | Matrix Sum · Count the Row Sums |
| 10 | Expert · Hard | Numbers & Math | Is It Prime? · GCD |
| 11 | Expert · Hard | String Algorithms | Longest Word · Are They Anagrams? |
| 12 | Expert · Hard | The Grand Finale | Perfect Number · FizzBuzz Extreme |
| 13 | Master · Hard | Dictionaries in Depth | Word Counter · Most Frequent Element |
| 14 | Master · Hard | Advanced Loops | Number Triangle · Multiplication Table |
| 15 | Master · Hard | List Mastery | Squares List · Even Numbers |
| 16 | Master · Hard | String Builder | Uppercase First Letters · Remove Vowels |
| 17 | Master · Hard | Numbers & Digits | Count Digits · Divisible by 3 and 5 |
| 18 | Master · Hard | Comprehensions | Filter Positives · First Letters |
| 19 | Legend · Hard | Two Pointers | Pair Sum · Reverse In Place |
| 20 | Legend · Hard | Sliding Window | Max Sum Window · Sliding Average |
| 21 | Legend · Hard | Binary Search | First True · Lower Bound |
| 22 | Legend · Hard | Sorting Masters | Sort by Frequency · Sort by Absolute Value |
| 23 | Legend · Hard | Recursion III | Sum of Digits (recursive) · Count Down Even |
| 24 | Legend · Hard | Number Theory | Prime Factors · Sum of Divisors |
| 25 | Mythic · Hard | Greedy Algorithms | Coin Change Greedy · Max Meetings |
| 26 | Mythic · Hard | Graph Traversal | Reachable Nodes · Shortest Hops (BFS) |
| 27 | Mythic · Hard | Dynamic Programming I | Climbing Stairs · Min Cost Path |
| 28 | Mythic · Hard | Dynamic Programming II | 0/1 Knapsack · Subset Sum |
| 29 | Mythic · Hard | Advanced String Tricks | Longest Palindromic Substring · Anagram Pairs Count |
| 30 | Mythic · Hard | Grand Finale | FizzBuzz Deluxe · Matrix Spiral |

Add or tweak challenges in `backend/app/seed.py` — each defines starter code,
sample tests, and hidden tests.

## API reference (summary)

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| GET | `/api/v1/auth/me` | ✔ (Firebase ID token) | – |
| GET | `/api/v1/levels` | ✔ | – |
| GET | `/api/v1/levels/{id}` | ✔ | – |
| POST | `/api/v1/challenges/{id}/run` | ✔ | `{challenge_id, code}` |
| POST | `/api/v1/challenges/{id}/submit` | ✔ | `{challenge_id, code}` |
| GET | `/api/v1/leaderboard` | ✔ | – |
| GET | `/api/v1/submissions/me` | ✔ | – |

> Signup & login happen entirely in the browser via the Firebase web SDK; the
> backend never sees passwords. Send the resulting ID token as
> `Authorization: Bearer <token>` on every authenticated call.

## Roadmap (post-MVP)

- More languages (JS, Java, C++) behind per-language runtimes
- gVisor / Firecracker hard isolation
- Autosave drafts, code autocomplete, per-challenge generated feedback
- Admin UI to author challenges; streak tracking

## Smoke test

`backend/smoke_test6.py` grades every seeded challenge (run + submit) against a
live server. It needs a Firebase user — set its `EMAIL`/`PASSWORD` at the top of
the file to an account that exists in your Firebase Auth, or sign up via the UI
first. Run it while uvicorn is up.