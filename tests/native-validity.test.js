import { beforeEach, describe, it, expect } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("native validity states", () => {
	it("shows default required error", () => {
		const { get } = setup(`<input required aria-describedby="msg" /><span id="msg"></span>`);
		fire(get("input"), "blur");
		expect(get("#msg").textContent).toBe("This field is required.");
	});

	it("shows custom required error", () => {
		const { get } = setup(`
			<input required aria-describedby="msg" data-required-err="Custom required." />
			<span id="msg"></span>
		`);
		fire(get("input"), "blur");
		expect(get("#msg").textContent).toBe("Custom required.");
	});

	it("shows type mismatch error for invalid email", () => {
		const { get } = setup(`
			<input type="email" required aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");
		input.value = "not-an-email";
		fire(input, "input");
		expect(get("#msg").textContent).toBe("The value is not the correct type.");
	});

	it("shows pattern mismatch error", () => {
		const { get } = setup(`
			<input pattern="[a-z]+" aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");
		input.value = "123";
		fire(input, "input");
		expect(get("#msg").textContent).toBe("The value does not match the required pattern.");
	});

	it("shows minlength error", () => {
		const { get } = setup(`
			<input minlength="5" aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");
		input.value = "ab";
		// jsdom follows the spec: tooShort only fires after user interaction, not programmatic assignment.
		// Mock validity to simulate what a real browser reports after the user types.
		Object.defineProperty(input, "validity", {
			get: () => ({ valid: false, tooShort: true, valueMissing: false, typeMismatch: false, patternMismatch: false, tooLong: false, rangeOverflow: false, rangeUnderflow: false, stepMismatch: false, badInput: false }),
			configurable: true,
		});
		fire(input, "blur");
		expect(get("#msg").textContent).toBe("The value is too short.");
	});

	it("shows maxlength error", () => {
		const { get } = setup(`
			<input maxlength="3" aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");
		// jsdom enforces maxlength via setCustomValidity simulation; use Object.defineProperty to bypass
		Object.defineProperty(input, "validity", {
			get: () => ({ valid: false, tooLong: true, valueMissing: false, typeMismatch: false, patternMismatch: false, tooShort: false, rangeOverflow: false, rangeUnderflow: false, stepMismatch: false, badInput: false }),
			configurable: true,
		});
		fire(input, "input");
		expect(get("#msg").textContent).toBe("The value is too long.");
	});

	it("shows rangeUnderflow error", () => {
		const { get } = setup(`
			<input type="number" min="5" aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");
		input.value = "2";
		fire(input, "input");
		expect(get("#msg").textContent).toBe("The value is too small.");
	});

	it("shows rangeOverflow error", () => {
		const { get } = setup(`
			<input type="number" max="10" aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");
		input.value = "20";
		fire(input, "input");
		expect(get("#msg").textContent).toBe("The value is too large.");
	});

	it("shows stepMismatch error", () => {
		const { get } = setup(`
			<input type="number" min="0" max="10" step="2" aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");
		input.value = "3";
		fire(input, "input");
		expect(get("#msg").textContent).toBe("The value does not match the step interval.");
	});
});
