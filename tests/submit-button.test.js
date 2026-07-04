import { beforeEach, describe, it, expect, vi } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("submit button (data-submit)", () => {
	it("disables the submit button when the form is initially invalid", () => {
		const { get } = setup(`
			<input required />
			<button type="submit" data-submit>Submit</button>
		`);
		expect(get("button").disabled).toBe(true);
	});

	it("enables the submit button once all fields are valid", () => {
		const { get } = setup(`
			<input required aria-describedby="msg" />
			<span id="msg"></span>
			<button type="submit" data-submit>Submit</button>
		`);
		const input = get("input");
		input.value = "hello";
		fire(input, "input");
		expect(get("button").disabled).toBe(false);
	});

	it("re-disables the submit button when a field becomes invalid", () => {
		const { get } = setup(`
			<input required aria-describedby="msg" />
			<span id="msg"></span>
			<button type="submit" data-submit>Submit</button>
		`);
		const input = get("input");
		input.value = "hello";
		fire(input, "input");
		expect(get("button").disabled).toBe(false);

		input.value = "";
		fire(input, "input");
		expect(get("button").disabled).toBe(true);
	});

	it("works with input[type=submit]", () => {
		const { get } = setup(`
			<input required />
			<input type="submit" data-submit />
		`);
		expect(get("input[type=submit]").disabled).toBe(true);
	});

	it("warns and ignores data-submit on a non-submit button", () => {
		// Non-form-controls (e.g. <div>) never appear in form.elements, so the guard
		// can only be triggered by a form control that has data-submit but is not type=submit.
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		setup(`<button type="button" data-submit>Not a submit</button>`);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining("data-submit expected"));
		warn.mockRestore();
	});
});
