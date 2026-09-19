import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { cloudflare } from "@cloudflare/vite-plugin";

// The Cloudflare plugin sets up a workerd runtime environment that vitest's
// own vite pipeline doesn't need and shouldn't pay the cost of — only load
// it outside test runs.
const isTest = !!process.env.VITEST;

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), ...(isTest ? [] : [cloudflare()])],
	test: {
		globalSetup: "./vitest.setup.ts",
		pool: "vmForks",
		projects: [
			{
				plugins: [react()],
				test: {
					name: "browser",
					include: ["**/*.browser.test.tsx"],
					// Worktrees under .claude/ carry their own node_modules; picking up
					// their tests loads a second React copy and breaks every render.
					exclude: ["**/node_modules/**", "**/.claude/**"],
					browser: {
						enabled: true,
						instances: [{ browser: "chromium" }],
						provider: playwright(),
					},
				},
			},

		],
	},
});
