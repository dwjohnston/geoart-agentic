// Generates src/algorithms/index.generated.ts from reference algorithm files,
// replacing import.meta.glob (Vite-only) with static imports compatible with bun test.
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { TypeNarrowingError } from "../../common-tooling/errors/TypeNarrowingError";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function filePathToId(filePath: string): string {
	const lastSegment = filePath.split("/").pop();
	if (!lastSegment) throw new TypeNarrowingError();
	const filename = lastSegment
		.replace(/\.ts$/, "")
		.replace(/ReferenceGraph$/, "");
	return filename.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function basenameToIdentifier(basename: string): string {
	return basename.replace(/[^a-zA-Z0-9_$]/g, "_").replace(/^(\d)/, "_$1");
}

export function generateAlgorithmsIndexContent(
	relativeFilePaths: string[],
): string {
	const entries = relativeFilePaths.map((p) => ({
		identifier: basenameToIdentifier(path.basename(p, ".ts")),
		importPath: p.replace(/\.ts$/, ""),
		rawPath: p,
	}));

	const usedIdentifiers = new Set<string>();
	for (const entry of entries) {
		const baseId = entry.identifier;
		let id = baseId;
		let suffix = 2;
		while (usedIdentifiers.has(id)) {
			id = `${baseId}_${suffix++}`;
		}
		entry.identifier = id;
		usedIdentifiers.add(id);
	}

	const imports = entries
		.map((e) => `import ${e.identifier} from '${e.importPath}';`)
		.join("\n");

	const rawEntries = entries
		.map((e) => `  ['${e.rawPath}', ${e.identifier}]`)
		.join(",\n");

	return `// AUTO-GENERATED — do not edit by hand. Run \`bun generate:algorithms-index\` to regenerate.
import type { GeoArtGraph } from '../schema/_generated/schema-types';

export type GraphEntry = {
  id: string;
  name: string;
  graph: GeoArtGraph;
};

${imports}

function filePathToId(filePath: string): string {
  const filename = filePath.split('/').pop()!.replace(/\\.ts$/, '').replace(/ReferenceGraph$/, '');
  return filename.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

const rawEntries: [string, GeoArtGraph][] = [
${rawEntries}
];

export const GRAPHS: GraphEntry[] = rawEntries.map(([filePath, graph]) => {
  const id = filePathToId(filePath);
  return { id, name: graph.title ?? id, graph };
});

export const DEFAULT_GRAPH_ID = GRAPHS[0].id;

export function getGraph(id: string): GraphEntry {
  const entry = GRAPHS.find(g => g.id === id);
  if (!entry) throw new Error(\`Unknown graph id: \${id}\`);
  return entry;
}
`;
}

function scanAlgorithmFiles(
	referenceDir: string,
	algorithmsDir: string,
): string[] {
	const results: string[] = [];

	function walk(dir: string): void {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			if (entry.isDirectory()) {
				walk(path.join(dir, entry.name));
			} else if (entry.name.endsWith(".ts") && !entry.name.includes(".test.")) {
				const absPath = path.join(dir, entry.name);
				const rel =
					`./${path.relative(algorithmsDir, absPath).replace(/\\/g, "/")}`;
				results.push(rel);
			}
		}
	}

	walk(referenceDir);
	return results.sort();
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
	const algorithmsDir = path.resolve(__dirname, "..");
	const referenceDir = path.join(algorithmsDir, "reference");

	const relativeFilePaths = scanAlgorithmFiles(referenceDir, algorithmsDir);
	const content = generateAlgorithmsIndexContent(relativeFilePaths);

	fs.writeFileSync(path.join(algorithmsDir, "index.generated.ts"), content);

	console.log("Generated algorithms index.");
}
