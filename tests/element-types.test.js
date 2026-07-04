import { beforeEach, describe, it, expect } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("textarea and select elements", () => {
	it("validates a required textarea", () => {
		const { get } = setup(`<textarea required aria-describedby="msg"></textarea><span id="msg"></span>`);
		fire(get("textarea"), "blur");
		expect(get("textarea").getAttribute("aria-invalid")).toBe("true");
		expect(get("#msg").textContent).toBe("This field is required.");
	});

	it("validates a required select", () => {
		const { get } = setup(`
			<select required aria-describedby="msg">
				<option value="">Choose</option>
				<option value="a">A</option>
			</select>
			<span id="msg"></span>
		`);
		fire(get("select"), "blur");
		expect(get("select").getAttribute("aria-invalid")).toBe("true");
	});

	it("clears validation when a select gets a valid value", () => {
		const { get } = setup(`
			<select required aria-describedby="msg">
				<option value="">Choose</option>
				<option value="a">A</option>
			</select>
			<span id="msg"></span>
		`);
		const select = get("select");
		fire(select, "blur");
		expect(select.getAttribute("aria-invalid")).toBe("true");

		select.value = "a";
		fire(select, "change");
		expect(select.getAttribute("aria-invalid")).toBe("false");
	});
});
