import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	test: {
		browser: {
			enabled: true,
			instances: [{ browser: "chromium" }],
			provider: playwright(),
		},
	},
});
