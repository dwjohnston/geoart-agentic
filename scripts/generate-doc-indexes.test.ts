import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { parseFrontMatter, filenameToTitle, generate } from "./generate-doc-indexes";

const TMP = resolve(import.meta.dir, "__test_tmp_docs__");

describe("parseFrontMatter", () => {
  it("extracts title and description", () => {
    const content = `---\ntitle: My Title\ndescription: a short summary\n---\n\n# Body`;
    expect(parseFrontMatter(content)).toEqual({ title: "My Title", description: "a short summary" });
  });

  it("returns empty object when no front matter", () => {
    expect(parseFrontMatter("# Just a heading\n\nSome content.")).toEqual({});
  });

  it("ignores unknown front matter keys", () => {
    const content = `---\ncanon: 👑\ntitle: Foo\n---\n`;
    expect(parseFrontMatter(content)).toEqual({ title: "Foo" });
  });
});

describe("filenameToTitle", () => {
  it("converts underscored filename to title case", () => {
    expect(filenameToTitle("conceptual_architecture.md")).toBe("Conceptual Architecture");
  });

  it("converts hyphenated filename to title case", () => {
    expect(filenameToTitle("md-audit.md")).toBe("Md Audit");
  });

  it("lowercases all-caps filenames before title-casing", () => {
    expect(filenameToTitle("FILE_STRUCTURE.md")).toBe("File Structure");
  });
});

describe("generate", () => {
  beforeEach(() => mkdirSync(TMP, { recursive: true }));
  afterEach(() => rmSync(TMP, { recursive: true, force: true }));

  it("produces a section per subfolder with doc entries", () => {
    mkdirSync(join(TMP, "architecture"));
    writeFileSync(
      join(TMP, "architecture", "overview.md"),
      `---\ntitle: Overview\ndescription: the big picture\n---\n# Overview\n`,
    );

    const result = generate(TMP);

    expect(result).toContain("## Architecture");
    expect(result).toContain("- [Overview](architecture/overview.md) — the big picture");
  });

  it("falls back to filename title when front matter is absent", () => {
    mkdirSync(join(TMP, "conventions"));
    writeFileSync(join(TMP, "conventions", "code_style.md"), "## Code Style\nsome content\n");

    const result = generate(TMP);

    expect(result).toContain("- [Code Style](conventions/code_style.md)");
  });

  it("lists root-level md files under Root Files", () => {
    writeFileSync(join(TMP, "readme.md"), "# Readme\n");

    const result = generate(TMP);

    expect(result).toContain("## Root Files");
    expect(result).toContain("- [Readme](readme.md)");
  });

  it("skips _index.md files", () => {
    mkdirSync(join(TMP, "workflow"));
    writeFileSync(join(TMP, "workflow", "_index.md"), "# Index\n");
    writeFileSync(join(TMP, "workflow", "guide.md"), "# Guide\n");

    const result = generate(TMP);

    expect(result).not.toContain("_index.md");
    expect(result).toContain("guide.md");
  });

  it("skips _ and . prefixed directories", () => {
    mkdirSync(join(TMP, "_templates"));
    writeFileSync(join(TMP, "_templates", "some.md"), "# Some\n");

    const result = generate(TMP);

    expect(result).not.toContain("Templates");
  });
});
