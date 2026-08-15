import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "../components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CodeLadder — Climb from Beginner to Mythic",
    template: "%s · CodeLadder",
  },
  description:
    "Practice Python coding level by level. Solve challenges, run your code live, earn XP, take quizzes, and climb from Beginner to Mythic.",
  keywords: [
    "coding practice",
    "learn python",
    "coding challenges",
    "CodeLadder",
    "programming drills",
    "python exercises",
  ],
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "CodeLadder — Climb from Beginner to Mythic",
    description:
      "Practice Python coding level by level. Solve challenges, earn XP, take quizzes, and climb the ladder.",
    siteName: "CodeLadder",
  },
  icons: {
    icon: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
  (function () {
    try {
      var stored = localStorage.getItem("codeladder_theme");
      var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (dark) document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}