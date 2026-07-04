import { beforeEach, describe, it, expect } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("validation events", () => {
	it("validates on input event", () => {
		const { get } = setup(`<input required />`);
		const input = get("input");
		fire(input, "input");
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	it("validates on change event", () => {
		const { get } = setup(`<input required />`);
		const input = get("input");
		fire(input, "change");
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	it("validates on blur event", () => {
		const { get } = setup(`<input required />`);
		const input = get("input");
		fire(input, "blur");
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});
});
