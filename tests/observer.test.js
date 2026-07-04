import { beforeEach, describe, it, expect } from "vitest";
import { fire, flushObserver } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("MutationObserver", () => {
	it("initialises a form added directly to the DOM", async () => {
		const form = document.createElement("form");
		form.setAttribute("data-validate", "");
		form.innerHTML = `<input required aria-describedby="msg" /><span id="msg"></span>`;
		document.body.appendChild(form);

		await flushObserver();

		const input = form.querySelector("input");
		fire(input, "blur");
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	it("initialises a form added inside a container", async () => {
		const container = document.createElement("div");
		container.innerHTML = `
			<form data-validate>
				<input required aria-describedby="msg" />
				<span id="msg"></span>
			</form>
		`;
		document.body.appendChild(container);

		await flushObserver();

		const input = container.querySelector("input");
		fire(input, "blur");
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	it("initialises an input added to an existing data-validate form", async () => {
		const form = document.createElement("form");
		form.setAttribute("data-validate", "");
		document.body.appendChild(form);

		await flushObserver();

		const input = document.createElement("input");
		input.required = true;
		input.setAttribute("aria-describedby", "msg");

		const msg = document.createElement("span");
		msg.id = "msg";

		form.appendChild(input);
		form.appendChild(msg);

		await flushObserver();

		fire(input, "blur");
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	it("does not initialise forms without data-validate", async () => {
		const form = document.createElement("form");
		form.innerHTML = `<input required aria-describedby="msg" /><span id="msg"></span>`;
		document.body.appendChild(form);

		await flushObserver();

		const input = form.querySelector("input");
		fire(input, "blur");
		expect(input.hasAttribute("aria-invalid")).toBe(false);
	});

	it("does not add duplicate listeners when the observer fires multiple times for the same form", async () => {
		const form = document.createElement("form");
		form.setAttribute("data-validate", "");
		form.innerHTML = `<input required aria-describedby="msg" /><span id="msg"></span>`;
		document.body.appendChild(form);

		await flushObserver();

		const msg = form.querySelector("#msg");
		let writeCount = 0;
		const originalDescriptor = Object.getOwnPropertyDescriptor(Node.prototype, "textContent");
		Object.defineProperty(msg, "textContent", {
			set(v) { writeCount++; originalDescriptor.set.call(this, v); },
			get() { return originalDescriptor.get.call(this); },
			configurable: true,
		});

		fire(form.querySelector("input"), "blur");
		expect(writeCount).toBe(1);
	});
});
