import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');

/**
 * Extracts the default or named export from a TypeScript file.
 * Looks for patterns like: `export const someName:` or `export const someName =`
 */
function extractExportName(content: string): string | null {
	const match = content.match(/export\s+const\s+(\w+)/);
	return match ? match[1] : null;
}

function filenameToDisplayName(filename: string): string {
	let name = filename.replace(/ReferenceGraph$/, '');

	// Convert camelCase to Title Case
	name = name
		.replace(/([A-Z])/g, ' $1')
		.trim()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');

	return name;
}

/**
 * Generates an id from filename by converting to kebab-case
 */
function filenameToId(filename: string): string {
	const name = filename.replace(/ReferenceGraph$/, '');

	return name
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.toLowerCase();
}

interface GraphInfo {
	filepath: string;
	relativeImportPath: string;
	exportName: string;
	id: string;
	displayName: string;
}

/**
 * Recursively find all files matching a pattern
 */
function findFiles(dir: string, pattern: RegExp, results: string[] = []): string[] {
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			findFiles(fullPath, pattern, results);
		} else if (pattern.test(entry.name)) {
			results.push(fullPath);
		}
	}

	return results;
}

function generateIndex(): void {
	const referenceDir = path.join(projectRoot, 'src/algorithms/reference');

	const files = findFiles(referenceDir, /(?<!index)\.ts$/).sort();

	const graphs: GraphInfo[] = [];

	for (const file of files) {
		const content = fs.readFileSync(file, 'utf-8');
		const exportName = extractExportName(content);

		if (!exportName) {
			console.warn(`⚠️  Could not find export in ${file}`);
			continue;
		}

		const filename = path.basename(file, '.ts');
		const relativeDir = path.relative(referenceDir, path.dirname(file));
		const relativeImportPath = relativeDir
			? `./${relativeDir}/${filename}`
			: `./${filename}`;

		graphs.push({
			filepath: file,
			relativeImportPath,
			exportName,
			id: filenameToId(filename),
			displayName: filenameToDisplayName(filename),
		});
	}

	// Generate the index file content
	const imports = graphs
		.map(g => `import { ${g.exportName} } from '${g.relativeImportPath}';`)
		.join('\n');

	const graphEntries = graphs
		.map(g => `  { id: '${g.id}', name: '${g.displayName}', graph: ${g.exportName} },`)
		.join('\n');

	const indexContent = `// This file is auto-generated. Run: bun run generate:algorithms-index
import type { GraphEntry } from '../index';

${imports}

export const REFERENCE_GRAPHS: GraphEntry[] = [
${graphEntries}
];
`;

	const outputPath = path.join(referenceDir, '_index.ts');

	fs.writeFileSync(outputPath, indexContent);

	console.log(`✓ Generated ${outputPath}`);
	console.log(`✓ Found ${graphs.length} reference graphs`);
	graphs.forEach(g => {
		console.log(`  - ${g.id}: "${g.displayName}"`);
	});
}

generateIndex();
