const Formageddon = (() => {
	"use strict";

	const forms = new WeakSet();
	const tags = ["INPUT", "TEXTAREA", "SELECT"];
	const attrs = ["accept", "min", "max", "step", "minlength", "maxlength", "pattern", "required"];
	const errors = {
		valueMissing: { attr: "data-required-err", default: "This field is required." },
		typeMismatch: { attr: "data-type-err", default: "The value is not the correct type." },
		patternMismatch: { attr: "data-pattern-err", default: "The value does not match the required pattern." },
		tooLong: { attr: "data-maxlength-err", default: "The value is too long." },
		tooShort: { attr: "data-minlength-err", default: "The value is too short." },
		rangeOverflow: { attr: "data-max-err", default: "The value is too large." },
		rangeUnderflow: { attr: "data-min-err", default: "The value is too small." },
		stepMismatch: { attr: "data-step-err", default: "The value does not match the step interval." },
		badInput: { attr: "data-type-err", default: "The input value is invalid." },
	};

	function isValidAccept(input) {
		const accept = input.getAttribute("accept");
		if (!accept) return true;

		const acceptedTypes = accept.split(",").map((s) => s.trim().toLowerCase());
		const files = input.files;
		if (!files.length) return true;

		for (const file of files) {
			const fileType = file.type.toLowerCase();
			const fileName = file.name.toLowerCase();

			const matches = acceptedTypes.some((type) => {
				if (type.startsWith(".")) {
					return fileName.endsWith(type);
				} else if (type.endsWith("/*")) {
					return fileType.startsWith(type.slice(0, -1));
				} else {
					return fileType === type;
				}
			});

			if (!matches) return false;
		}
		return true;
	}

	// gets custom defined error if it exists, otherwise returns a default.
	function getError(input) {
		// validate for type=file accept
		if (input.type === "file" && input.hasAttribute("accept") && input.value.trim()) {
			if (!isValidAccept(input)) {
				return input.getAttribute("data-accept-err") || "Invalid file type.";
			}
		}

		// validate all others
		for (const [key, obj] of Object.entries(errors)) {
			if (input.validity[key]) {
				return input.getAttribute(obj.attr) || obj.default;
			}
		}

		return "";
	}

	function handleInvalidInput(input) {
		input.setAttribute("aria-invalid", "true");
		const target = input.getAttribute("data-target");
		if (target) {
			const targetEl = document.querySelector(target);
			if (!targetEl) {
				console.error(`element not found for data-target="${target}"`);
			} else {
				targetEl.classList.add("invalid");
				targetEl.classList.remove("valid");
				targetEl.textContent = getError(input);
			}
		}
	}

	function handleValidInput(input) {
		input.setAttribute("aria-invalid", "false");
		const target = input.getAttribute("data-target");
		if (target) {
			const targetEl = document.querySelector(target);
			if (!targetEl) {
				console.error(`element not found for data-target="${target}"`);
			} else {
				targetEl.classList.add("valid");
				targetEl.classList.remove("invalid");
				targetEl.textContent = input.getAttribute("data-success") || "";
			}
		}
	}
})();
