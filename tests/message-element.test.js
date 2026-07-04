import { beforeEach, describe, it, expect } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("message element", () => {
	it("sets the message text on invalid", () => {
		const { get } = setup(`
			<input required aria-describedby="msg" />
			<span id="msg"></span>
		`);
		fire(get("input"), "blur");
		expect(get("#msg").textContent).toBe("This field is required.");
	});

	it("adds the invalid class and removes valid on invalid", () => {
		const { get } = setup(`
			<input required aria-describedby="msg" />
			<span id="msg" class="valid"></span>
		`);
		fire(get("input"), "blur");
		expect(get("#msg").classList.contains("invalid")).toBe(true);
		expect(get("#msg").classList.contains("valid")).toBe(false);
	});

	it("sets the message text on valid", () => {
		const { get } = setup(`
			<input required aria-describedby="msg" data-success="Looks good!" />
			<span id="msg"></span>
		`);
		const input = get("input");
		input.value = "hello";
		fire(input, "input");
		expect(get("#msg").textContent).toBe("Looks good!");
	});

	it("adds the valid class and removes invalid on valid", () => {
		const { get } = setup(`
			<input required aria-describedby="msg" />
			<span id="msg" class="invalid"></span>
		`);
		const input = get("input");
		input.value = "hello";
		fire(input, "input");
		expect(get("#msg").classList.contains("valid")).toBe(true);
		expect(get("#msg").classList.contains("invalid")).toBe(false);
	});

	it("clears the message and classes when a non-required field is emptied", () => {
		const { get } = setup(`
			<input pattern="[a-z]+" aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");

		input.value = "123";
		fire(input, "input");
		expect(get("#msg").textContent).not.toBe("");

		input.value = "";
		fire(input, "input");
		expect(get("#msg").textContent).toBe("");
		expect(get("#msg").classList.contains("invalid")).toBe(false);
		expect(get("#msg").classList.contains("valid")).toBe(false);
	});

	it("does not error when there is no aria-describedby element", () => {
		const { get } = setup(`<input required />`);
		expect(() => fire(get("input"), "blur")).not.toThrow();
	});
});
