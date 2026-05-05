import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";




// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	test: {
		globalSetup: "./vitest.setup.ts",
		pool: "vmForks",
		projects: [
			{
				plugins: [react()],
				test: {
					name: "browser",
					include: ["**/*.test.tsx"],
					browser: {
						enabled: true,
						instances: [{ browser: "chromium" }],
						provider: playwright(),
					},
				},
			},
			{
				test: {
					name: "unit",
					include: ["**/*.test.ts"],
				},
			},
		],
	},
});
