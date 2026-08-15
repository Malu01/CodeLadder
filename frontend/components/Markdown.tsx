// Lightweight markdown renderer for challenge statements.
// Supports paragraphs, inline `code`, **bold**, *italic*, headings,
// bullet/numbered lists, and fenced code blocks. Safe by construction:
// it never injects HTML, so no sanitization is needed.
import React from "react";

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyPrefix}-${i}`}
          className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.85em] text-rose-600 dark:bg-slate-800 dark:text-rose-300"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <em key={`${keyPrefix}-${i}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    i++;
    last = m.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre
          key={key++}
          className="my-2 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100"
        >
          <code className="font-mono">{buf.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Heading
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      const cls = level <= 2 ? "text-lg font-bold" : "text-sm font-semibold";
      blocks.push(
        <p key={key++} className={`mb-1 mt-3 ${cls} text-slate-900 dark:text-white`}>
          {renderInline(h[2], `h${key}`)}
        </p>
      );
      i++;
      continue;
    }

    // Bullet list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(
          <li key={key++} className="flex gap-2">
            <span className="text-slate-400">•</span>
            <span>{renderInline(lines[i].replace(/^\s*[-*]\s+/, ""), `b${key}`)}</span>
          </li>
        );
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-1.5 space-y-1 pl-1 text-slate-700 dark:text-slate-300">
          {items}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      let n = 1;
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(
          <li key={key++} className="flex gap-2">
            <span className="text-slate-400">{n}.</span>
            <span>{renderInline(lines[i].replace(/^\s*\d+\.\s+/, ""), `n${key}`)}</span>
          </li>
        );
        n++;
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-1.5 space-y-1 pl-1 text-slate-700 dark:text-slate-300">
          {items}
        </ol>
      );
      continue;
    }

    // Blank line → paragraph break
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph: collect until blank line
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("```")) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="mb-2 leading-relaxed text-slate-700 dark:text-slate-300">
        {renderInline(para.join("\n").replace(/\s*\n\s*/g, " "), `p${key}`)}
      </p>
    );
  }

  return <div className="text-sm">{blocks}</div>;
}
