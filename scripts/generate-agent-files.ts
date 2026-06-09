// Composes on-disk prompt files from a fragment pool via templates.
// Usage: bun scripts/generate-agent-files.ts <approach>
//
// Templates live in templates/<approach>/ and mirror the repo root.
// The output path of each template is its path with the templates/<approach>/ prefix stripped.
// Markdown files are processed; non-.md files are copied verbatim.
//
// Directives:
//   <!-- include: path/to/fragment.md -->           — splice entire file
//   <!-- include: path/to/fragment.md#Section -->   — splice section (heading to next same-or-higher heading)
//   <!-- template: other-approach -->               — whole-file alias (same relative path in other approach)
//   <!-- template: other-approach/rel/path.md -->   — whole-file alias (explicit path within other approach)
//
// Cleanup: before generating, all output paths across ALL approaches are deleted.
// Outputs are gitignored — they are ephemeral per-experiment artifacts.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync, statSync, copyFileSync } from "fs";
import { resolve, dirname, relative, extname, join } from "path";

const ROOT = resolve(import.meta.dir, "..");
const TEMPLATES_DIR = resolve(ROOT, "projectDocs/_templates");

export function extractSection(content: string, sectionName: string, sourcePath: string): string {
  const lines = content.split("\n");
  let startIdx = -1;
  let headingLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (match && match[2].trim() === sectionName) {
      startIdx = i;
      headingLevel = match[1].length;
      break;
    }
  }

  if (startIdx === -1) {
    throw new Error(`Section "#${sectionName}" not found in ${sourcePath}`);
  }

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s/);
    if (match && match[1].length <= headingLevel) {
      endIdx = i;
      break;
    }
  }

  return lines.slice(startIdx, endIdx).join("\n");
}

export function processIncludes(content: string, templateFilePath: string): string {
  return content.replace(/<!-- include: ([^>]+) -->/g, (_match, ref: string) => {
    const trimmed = ref.trim();
    const hashIdx = trimmed.indexOf("#");
    const filePath = hashIdx >= 0 ? trimmed.slice(0, hashIdx) : trimmed;
    const section = hashIdx >= 0 ? trimmed.slice(hashIdx + 1) : null;

    const fullPath = resolve(ROOT, filePath);
    if (!existsSync(fullPath)) {
      throw new Error(`Include file not found: ${filePath} (referenced in ${templateFilePath})`);
    }

    const raw = readFileSync(fullPath, "utf-8");
    const fileContent = raw.replace(/^---[ \t]*\n[\s\S]*?\n---[ \t]*\n/, "");
    if (!section) return fileContent;

    return extractSection(fileContent, section, filePath);
  });
}

export function resolveTemplateContent(
  templatePath: string,
  approach: string,
  seen: string[] = [],
): string {
  if (seen.includes(templatePath)) {
    throw new Error(`Circular template reference: ${[...seen, templatePath].join(" -> ")}`);
  }

  const content = readFileSync(templatePath, "utf-8");

  const templateMatch = content.match(/<!--\s*template:\s*([^\s>]+)\s*-->/);
  if (templateMatch) {
    const ref = templateMatch[1].trim();
    let targetPath: string;

    if (ref.includes("/")) {
      targetPath = resolve(TEMPLATES_DIR, ref);
    } else {
      const relPath = relative(resolve(TEMPLATES_DIR, approach), templatePath);
      targetPath = resolve(TEMPLATES_DIR, ref, relPath);
    }

    if (!existsSync(targetPath)) {
      throw new Error(`Template target not found: ${ref} (referenced in ${templatePath})`);
    }

    return resolveTemplateContent(targetPath, ref, [...seen, templatePath]);
  }

  return processIncludes(content, templatePath);
}

function walkDir(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

export function getAllOutputPaths(): string[] {
  if (!existsSync(TEMPLATES_DIR)) return [];

  const paths: string[] = [];
  for (const approach of readdirSync(TEMPLATES_DIR)) {
    const approachDir = resolve(TEMPLATES_DIR, approach);
    if (!statSync(approachDir).isDirectory()) continue;
    for (const templateFile of walkDir(approachDir)) {
      paths.push(resolve(ROOT, relative(approachDir, templateFile)));
    }
  }

  return [...new Set(paths)];
}

export function generateApproach(approach: string): void {
  const approachDir = resolve(TEMPLATES_DIR, approach);
  if (!existsSync(approachDir)) {
    throw new Error(`Approach not found: _templates/${approach}/`);
  }

  for (const outputPath of getAllOutputPaths()) {
    if (existsSync(outputPath)) {
      rmSync(outputPath);
    }
  }

  for (const templatePath of walkDir(approachDir)) {
    const relPath = relative(approachDir, templatePath);
    const outputPath = resolve(ROOT, relPath);

    mkdirSync(dirname(outputPath), { recursive: true });

    if (extname(templatePath) === ".md") {
      writeFileSync(outputPath, resolveTemplateContent(templatePath, approach), "utf-8");
    } else {
      copyFileSync(templatePath, outputPath);
    }

    console.log(`  ${relPath}`);
  }
}

if (import.meta.main) {
  const approach = process.argv[2];
  if (!approach) {
    console.error("Usage: bun scripts/generate-agent-files.ts <approach>");
    process.exit(1);
  }

  try {
    console.log(`Generating approach: ${approach}`);
    generateApproach(approach);
    console.log(`\nDone.`);
  } catch (err) {
    console.error(`\nError: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
