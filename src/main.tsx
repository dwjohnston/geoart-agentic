import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./application/index.css";
import { App } from "./application/App.tsx";

const root = document.getElementById("root");
if (!root) {
	throw new Error("Root element not found");
}
createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
