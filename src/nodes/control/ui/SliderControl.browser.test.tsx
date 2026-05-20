import { afterEach, describe, expect, test, vi } from "vitest";
import { render, cleanup, within, fireEvent } from "@testing-library/react";
import { SliderControl } from "./SliderControl";

afterEach(cleanup);

const baseProps = {
	id: "speed",
	label: "Speed",
	min: 0,
	max: 10,
	step: 1,
	initialValue: 3,
};

describe("SliderControl", () => {
	test("renders label and current value", () => {
		const { container } = render(
			<SliderControl {...baseProps} onChange={() => {}} />,
		);
		expect(within(container).getByText("Speed")).toBeDefined();
		expect(within(container).getByRole("slider")).toBeDefined();
	});

	test("calls onChange with new value when dragged", () => {
		const onChange = vi.fn();
		const { container } = render(
			<SliderControl {...baseProps} onChange={onChange} />,
		);

		const slider = within(container).getByRole("slider") as HTMLInputElement;
		fireEvent.change(slider, { target: { value: "5" } });

		expect(onChange).toHaveBeenCalledWith(expect.any(Number));
	});

	test("respects min, max, step props", () => {
		const { container } = render(
			<SliderControl
				id="x"
				label=""
				min={0}
				max={1}
				step={0.1}
				initialValue={0}
				onChange={() => {}}
			/>,
		);
		const slider = within(container).getByRole("slider") as HTMLInputElement;
		expect(Number(slider.min)).toBe(0);
		expect(Number(slider.max)).toBe(1);
		expect(Number(slider.step)).toBe(0.1);
	});

	test("initialises with initialValue", () => {
		const { container } = render(
			<SliderControl
				id="x"
				label=""
				min={0}
				max={10}
				step={1}
				initialValue={7}
				onChange={() => {}}
			/>,
		);
		const slider = within(container).getByRole("slider") as HTMLInputElement;
		expect(Number(slider.value)).toBe(7);
	});

	test("displays value rounded to step decimal places", () => {
		const { container } = render(
			<SliderControl
				id="x"
				label=""
				min={0}
				max={10}
				step={0.1}
				initialValue={Math.PI}
				onChange={() => {}}
			/>,
		);
		const output = container.querySelector("output") as HTMLOutputElement;
		expect(output.textContent).toBe("3.1");
	});

	test("displays integer value when step is whole number", () => {
		const { container } = render(
			<SliderControl
				id="x"
				label=""
				min={0}
				max={10}
				step={1}
				initialValue={3.7}
				onChange={() => {}}
			/>,
		);
		const output = container.querySelector("output") as HTMLOutputElement;
		expect(output.textContent).toBe("4");
	});
});
