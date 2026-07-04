import { beforeEach, describe, it, expect, vi } from "vitest";
import { F, setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("re-initialisation safety", () => {
	it("does not attach duplicate event listeners when initForm is called twice", () => {
		const { form, get } = setup(`<input required aria-describedby="msg" /><span id="msg"></span>`);
		const input = get("input");

		const msg = get("#msg");
		let writeCount = 0;
		const originalDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, "textContent");
		Object.defineProperty(msg, "textContent", {
			set(v) { writeCount++; originalDescriptor.set.call(this, v); },
			get() { return originalDescriptor.get.call(this); },
			configurable: true,
		});

		F.initForm(form); // call a second time
		fire(input, "blur");

		expect(writeCount).toBe(1);
	});

	it("does not add duplicate form-level listeners for submit when initForm is called twice", () => {
		const { form } = setup(`
			<input required />
			<button type="submit" data-submit>Submit</button>
		`);

		const addEventListener = vi.spyOn(form, "addEventListener");
		F.initForm(form);

		const submitListeners = addEventListener.mock.calls.filter(([event]) =>
			["input", "change", "blur"].includes(event)
		);
		expect(submitListeners.length).toBe(0);

		addEventListener.mockRestore();
	});
});
