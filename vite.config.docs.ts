import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
	root: "docs",
	publicDir: path.resolve(__dirname, "docs/public"),
	server: {
		port: 5174,
	},
	build: {
		outDir: path.resolve(__dirname, "dist-docs"),
		emptyOutDir: true,
	},
	preview: {
		port: 5174,
	},
});
