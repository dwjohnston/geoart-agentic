import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Call } from "../../common-tooling/test-tooling/fakeContext";
import { replayCallsOnCanvas } from "../../common-tooling/test-tooling/replayContext";

const __dir = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = join(
	__dir,
	"__snapshots__/allReferenceGraphs.snapshot.test.ts.snap",
);
const OUTPUT_DIR = join(__dir, "_generated");

function parseSnapshot(content: string, testName: string): Call[] {
	const key = `exports[\`${testName}\`]`;
	const keyIndex = content.indexOf(key);
	if (keyIndex === -1)
		throw new Error(`Snapshot not found for test: "${testName}"`);

	const afterKey = content.slice(keyIndex + key.length);
	const openTick = afterKey.indexOf("`");
	const closeTick = afterKey.indexOf("\n`;", openTick + 1);
	const json = afterKey
		.slice(openTick + 1, closeTick)
		.replace(/:\s*,/g, ": null,")
		.replace(/,(\s*[\]}])/g, "$1");
	return JSON.parse(json) as Call[];
}

function detectCanvasSize(calls: Call[]): { width: number; height: number } {
	const clearRect = calls.find(
		(c): c is Extract<Call, { kind: "method" }> =>
			c.kind === "method" && c.name === "clearRect",
	);
	if (clearRect && clearRect.args.length >= 4) {
		return {
			width: clearRect.args[2] as number,
			height: clearRect.args[3] as number,
		};
	}
	return { width: 800, height: 800 };
}

if (import.meta.main) {
	const testName = process.argv[2];
	if (!testName) {
		console.error("Usage: bun renderSnapshotToFile.ts <test-name>");
		process.exit(1);
	}
	console.log(renderSnapshotToFile(testName));
}

export function renderSnapshotToFile(testName: string): string {
	const calls = parseSnapshot(readFileSync(SNAPSHOT_PATH, "utf-8"), testName);
	const { width, height } = detectCanvasSize(calls);

	const buffer = replayCallsOnCanvas(calls, width, height).toBuffer(
		"image/png",
	);

	mkdirSync(OUTPUT_DIR, { recursive: true });
	const filename = `${testName.replace(/[^\w.-]/g, "_")}.png`;
	const outputPath = join(OUTPUT_DIR, filename);
	writeFileSync(outputPath, buffer);
	return outputPath;
}
