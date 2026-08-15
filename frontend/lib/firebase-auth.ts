// Firebase Auth singleton for the browser. api.ts dynamically imports this
// so server-side (SSR) code never touches Firebase.
import { getAuth } from "firebase/auth";
import { app } from "./firebase";

export const auth = getAuth(app!);
