# Setting up Firebase for CodeLadder

CodeLadder now uses Firebase for **everything except running Python code**:

- **Firebase Auth** — email/password signup & login (client-side in the browser).
- **Cloud Firestore** — users, levels, challenges, submissions.
- The FastAPI backend verifies login via the **Firebase Admin SDK** (service account).

You only need two things from the Firebase console: a **service account JSON**
(for the backend) and the **web app config** (for the frontend).

---

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com/> and click **Create a project**
   (or pick an existing one).
2. Name it (e.g. `codeladder`). Google Analytics is optional — skip it if you
   don't need it.

## 2. Enable email/password auth

1. In the Firebase console, go to **Build → Authentication → Get started**.
2. Open the **Sign-in method** tab.
3. Enable **Email/Password**.
4. Save.

## 3. Create the Firestore database

1. Go to **Build → Firestore Database → Create database**.
2. Pick **Production mode** (or Test mode for local dev — but Production mode is
   fine because the backend uses the Admin SDK, which bypasses rules; the
   frontend never writes directly to Firestore).
3. Choose a Cloud Firestore location and press **Enable**.

> You don't need to create any collections or indexes — the backend creates
> them on first boot. If a query errors with "index required", follow the link
> in the error message and click **Create index**.

## 4. Backend: download the service account

1. In the console go to **Project settings → Service accounts**.
2. Click **Generate new private key**, then **Generate key**. A JSON file
   downloads — this is the service account.
3. Save it to `backend/serviceAccount.json`.
4. In `backend/.env`, set:

   ```env
   FIREBASE_SERVICE_ACCOUNT_PATH=serviceAccount.json
   FIREBASE_PROJECT_ID=your-project-id
   ```

   Your project id is under **Project settings → General → Project ID** (it
   looks like `codeladder-abc12`).

> **Never commit `serviceAccount.json` to git.** It grants full access to your
> project. Add it to `.gitignore`.

## 5. Frontend: register a web app

1. In the console go to **Project settings → General → Your apps**.
2. Click **Add app** (the `</>` web icon). Nickname it `codeladder-web`.
3. Copy the config values and paste them into `frontend/.env.local`:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=codeladder-abc12.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=codeladder-abc12
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=codeladder-abc12.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef
   ```

4. Restart the frontend dev server (`npm run dev`) after editing `.env.local`.

## 6. Run it

```bash
# backend (needs serviceAccount.json + .env)
cd backend
uvicorn app.main:app --reload --port 8001

# frontend (needs .env.local)
cd frontend
npm run dev
```

Open `http://localhost:3000`, sign up, and you're in. The first backend boot
seeds the full curriculum (30 levels / 64 challenges) into Firestore.

---

## Notes

- **Indexes:** the `leaderboard` and `submissions` queries may ask you to create
  a composite index. Click the link in the error to create it — it takes about a
  minute to build.
- **Security rules:** since only the Admin SDK touches Firestore, the default
  rules are fine. Keep the frontend SDK read-only (never call Firestore from
  the browser).
- **Emulator (optional):** for offline dev, install `firebase-tools` and run
  `firebase emulators:start --only auth,firestore`. Point the web SDK at the
  emulator and set `FIRESTORE_EMULATOR_HOST`/`GCLOUD_PROJECT` for the Admin SDK.
