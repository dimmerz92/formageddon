import { beforeEach, describe, it, expect, vi } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("form reset", () => {
	it("clears all validation states when the form is reset", () => {
		const { form, get } = setup(`
			<input required aria-describedby="msg" />
			<span id="msg"></span>
			<button type="reset">Reset</button>
		`);
		const input = get("input");
		fire(input, "blur");
		expect(input.getAttribute("aria-invalid")).toBe("true");

		form.dispatchEvent(new Event("reset"));
		expect(input.hasAttribute("aria-invalid")).toBe(false);
		expect(get("#msg").textContent).toBe("");
		expect(get("#msg").classList.contains("invalid")).toBe(false);
	});

	it("does not add duplicate reset listeners for multiple reset buttons", () => {
		const addEventListener = vi.spyOn(HTMLFormElement.prototype, "addEventListener");

		setup(`
			<input required />
			<button type="reset">Reset 1</button>
			<button type="reset">Reset 2</button>
		`);

		const resetCalls = addEventListener.mock.calls.filter(([event]) => event === "reset");
		expect(resetCalls.length).toBe(1);

		addEventListener.mockRestore();
	});
});
