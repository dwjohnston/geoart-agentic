import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import { App } from "./App";

test("renders without crashing", () => {
	const { container } = render(<App />);
	expect(container).toBeTruthy();
});
