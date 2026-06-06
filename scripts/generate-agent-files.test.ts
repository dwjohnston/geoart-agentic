import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, rmSync, } from "fs";
import { resolve } from "path";
import {
  extractSection,
  processIncludes,
  resolveTemplateContent,
  generateApproach,
} from "./generate-agent-files";

const TMP = resolve(import.meta.dir, "__test_tmp__");

describe("extractSection", () => {
  it("extracts a section from its heading to the next same-level heading", () => {
    const content = `# Intro\nSome intro.\n## Section A\nContent A.\n## Section B\nContent B.`;
    expect(extractSection(content, "Section A", "test.md")).toBe(
      "## Section A\nContent A.",
    );
  });

  it("includes subsections when extracting a higher-level heading", () => {
    const content = `# Top\n## Sub\nsubcontent\n# Next Top`;
    expect(extractSection(content, "Top", "test.md")).toBe("# Top\n## Sub\nsubcontent");
  });

  it("throws when section not found", () => {
    expect(() => extractSection("# Foo\nbar", "Missing", "test.md")).toThrow(
      'Section "#Missing" not found',
    );
  });
});

describe("processIncludes", () => {
  beforeEach(() => mkdirSync(TMP, { recursive: true }));
  afterEach(() => rmSync(TMP, { recursive: true, force: true }));

  it("splices in an entire fragment file", () => {
    // Uses a real projectDocs file since processIncludes resolves paths from project ROOT
    const result = processIncludes(
      `Before\n<!-- include: projectDocs/terminology.md -->\nAfter`,
      "template.md",
    );
    expect(result).toContain("Before");
    expect(result).toContain("After");
    expect(result).toContain("terminology");
  });

  it("throws when include file does not exist", () => {
    expect(() =>
      processIncludes(
        `<!-- include: projectDocs/missing.md -->`,
        resolve(TMP, "template.md"),
      ),
    ).toThrow("Include file not found");
  });

  it("throws when section anchor is missing", () => {
    // Section extraction on a real file that exists but lacks the heading
    // Use a file in the actual project
    expect(() =>
      processIncludes(
        `<!-- include: projectDocs/terminology.md#NonExistentSection -->`,
        "template.md",
      ),
    ).toThrow('Section "#NonExistentSection" not found');
  });
});

describe("generateApproach", () => {
  beforeEach(() => mkdirSync(TMP, { recursive: true }));
  afterEach(() => rmSync(TMP, { recursive: true, force: true }));

  it("throws for a non-existent approach", () => {
    expect(() => generateApproach("__nonexistent__")).toThrow(
      "Approach not found: templates/__nonexistent__/",
    );
  });
});

describe("resolveTemplateContent", () => {
  it("throws on circular template references", () => {
    // Circular reference detection uses the 'seen' array
    const fakePath = "/fake/templates/a/file.md";
    expect(() =>
      resolveTemplateContent(fakePath, "a", [fakePath]),
    ).toThrow("Circular template reference");
  });
});
