import { beforeEach, describe, it, expect } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
	document.body.innerHTML = "";
});

describe("file accept validation", () => {
	function makeFileInput(accept, files) {
		const { get } = setup(`
			<input type="file" accept="${accept}" aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");
		Object.defineProperty(input, "files", { value: files, configurable: true });
		return { input, msg: get("#msg") };
	}

	it("shows an error when a file does not match the accept type", () => {
		const { input, msg } = makeFileInput("image/*", [
			new File([""], "document.pdf", { type: "application/pdf" }),
		]);
		fire(input, "change");
		expect(input.getAttribute("aria-invalid")).toBe("true");
		expect(msg.textContent).toBe("Invalid file type.");
	});

	it("shows a custom error message for an invalid file type", () => {
		const { input, msg } = makeFileInput("image/*", [
			new File([""], "document.pdf", { type: "application/pdf" }),
		]);
		input.setAttribute("data-accept-err", "Images only please.");
		fire(input, "change");
		expect(msg.textContent).toBe("Images only please.");
	});

	it("accepts a file that matches a MIME wildcard", () => {
		const { input } = makeFileInput("image/*", [
			new File([""], "photo.jpg", { type: "image/jpeg" }),
		]);
		fire(input, "change");
		expect(input.getAttribute("aria-invalid")).toBe("false");
	});

	it("accepts a file that matches an exact MIME type", () => {
		const { input } = makeFileInput("application/pdf", [
			new File([""], "doc.pdf", { type: "application/pdf" }),
		]);
		fire(input, "change");
		expect(input.getAttribute("aria-invalid")).toBe("false");
	});

	it("accepts a file that matches a file extension", () => {
		const { input } = makeFileInput(".pdf", [
			new File([""], "doc.pdf", { type: "application/pdf" }),
		]);
		fire(input, "change");
		expect(input.getAttribute("aria-invalid")).toBe("false");
	});

	it("is valid when no files are selected", () => {
		const { get } = setup(`
			<input type="file" accept="image/*" aria-describedby="msg" />
			<span id="msg"></span>
		`);
		const input = get("input");
		Object.defineProperty(input, "files", { value: [], configurable: true });
		fire(input, "change");
		expect(input.hasAttribute("aria-invalid")).toBe(false);
	});

	it("rejects any file in a multi-file selection that does not match", () => {
		const { input } = makeFileInput("image/*", [
			new File([""], "photo.jpg", { type: "image/jpeg" }),
			new File([""], "doc.pdf", { type: "application/pdf" }),
		]);
		fire(input, "change");
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});
});
