import { beforeEach, describe, it, expect } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("data-ignore", () => {
	it("does not attach validation to elements with data-ignore", () => {
		const { get } = setup(`<input required data-ignore />`);
		const input = get("input");
		fire(input, "blur");
		expect(input.hasAttribute("aria-invalid")).toBe(false);
	});
});

describe("disabled and read-only inputs", () => {
	it("skips validation for disabled inputs", () => {
		const { get } = setup(`<input required disabled />`);
		const input = get("input");
		fire(input, "blur");
		expect(input.hasAttribute("aria-invalid")).toBe(false);
	});

	it("skips validation for read-only inputs", () => {
		const { get } = setup(`<input required readonly aria-describedby="msg" /><span id="msg"></span>`);
		const input = get("input");
		fire(input, "blur");
		expect(input.hasAttribute("aria-invalid")).toBe(false);
	});
});
