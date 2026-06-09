// Generates projectDocs/_index.md from front matter in each doc file.
// Falls back to filename-derived title and no description when front matter is absent.
// Usage: bun scripts/generate-doc-indexes.ts

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { resolve, extname, basename, join } from "path";

const ROOT = resolve(import.meta.dir, "..");
const DOCS_DIR = resolve(ROOT, "projectDocs");

export interface FrontMatter {
  title?: string;
  description?: string;
}

export function parseFrontMatter(content: string): FrontMatter {
  const match = content.match(/^---[ \t]*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: FrontMatter = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(title|description):\s*(.+)$/);
    if (kv) result[kv[1] as keyof FrontMatter] = kv[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return result;
}

export function filenameToTitle(filename: string): string {
  return basename(filename, extname(filename))
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}

function docEntry(filePath: string, linkPath: string): string {
  const content = readFileSync(filePath, "utf-8");
  const fm = parseFrontMatter(content);
  const title = fm.title ?? filenameToTitle(filePath);
  return fm.description
    ? `- [${title}](${linkPath}) — ${fm.description}`
    : `- [${title}](${linkPath})`;
}

function folderToHeading(name: string): string {
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function generate(docsDir: string = DOCS_DIR): string {
  const lines: string[] = ["# Project Docs", ""];

  for (const entry of readdirSync(docsDir).sort()) {
    if (entry.startsWith(".") || entry.startsWith("_")) continue;
    const fullPath = join(docsDir, entry);
    if (!statSync(fullPath).isDirectory()) continue;

    const docs = readdirSync(fullPath)
      .filter(f => extname(f) === ".md" && f !== "_index.md")
      .sort();

    if (docs.length === 0) continue;

    lines.push(`## ${folderToHeading(entry)}`, "");
    for (const doc of docs) {
      lines.push(docEntry(join(fullPath, doc), `${entry}/${doc}`));
    }
    lines.push("");
  }

  const rootFiles = readdirSync(docsDir)
    .filter(f => extname(f) === ".md" && f !== "_index.md")
    .sort();

  if (rootFiles.length > 0) {
    lines.push("## Root Files", "");
    for (const file of rootFiles) {
      lines.push(docEntry(join(docsDir, file), file));
    }
    lines.push("");
  }

  return lines.join("\n");
}

if (import.meta.main) {
  const output = generate();
  writeFileSync(resolve(DOCS_DIR, "_index.md"), output, "utf-8");
  console.log("projectDocs/_index.md written.");
}
