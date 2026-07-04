import { beforeEach, describe, it, expect } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("aria-invalid", () => {
	it("sets aria-invalid=true when a required field is empty", () => {
		const { get } = setup(`<input required />`);
		const input = get("input");
		fire(input, "blur");
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	it("sets aria-invalid=false when a required field is filled", () => {
		const { get } = setup(`<input required />`);
		const input = get("input");
		input.value = "hello";
		fire(input, "input");
		expect(input.getAttribute("aria-invalid")).toBe("false");
	});

	it("removes aria-invalid when a non-required field is cleared", () => {
		const { get } = setup(`<input pattern="[a-z]+" />`);
		const input = get("input");

		input.value = "123";
		fire(input, "input");
		expect(input.getAttribute("aria-invalid")).toBe("true");

		input.value = "";
		fire(input, "input");
		expect(input.hasAttribute("aria-invalid")).toBe(false);
	});
});
