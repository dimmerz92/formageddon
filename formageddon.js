const Formageddon = (() => {
	"use strict";

	/** @type {WeakSet<HTMLFormElement>} - Tracks initialised forms to prevent duplication */
	const forms = new WeakSet();

	/** @type {string[]} - HTML form elements to validate */
	const tags = ["INPUT", "TEXTAREA", "SELECT"];

	/** @type {string[]} - Attributes to be validated */
	const attrs = ["accept", "min", "max", "step", "minlength", "maxlength", "pattern", "required"];

	/**
	 * Maps validity errors to attributes containing user defined custom error messages or default error messages.
	 * @type {Record<string, {attr: string, default: string}} - 
	 */
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

	/**
	* Validates file inputs with the accept attribute.
	* @param {HTMLInputElement} input - The file input element to validate.
	* @returns {boolean} True if all files match the accept attribute, false otherwise.
	*/
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

	/**
	* Returns a user defined error message if it exists, otherwise a default error message.
	* @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input - The form control to check.
	* @returns {string} The error message string.
	*/
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

	/**
	* Handles invalid input by setting aria-invalid=true and updating the associated error/success message container if
	* it exists.
	* @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input - The invalid form control.
	*/
	function handleInvalidInput(input) {
		input.setAttribute("aria-invalid", "true");
		const target = input.getAttribute("aria-describedby");
		if (target) {
			const targetEl = document.getElementById(target);
			if (!targetEl) {
				console.error(`element not found for aria-describedby="${target}"`);
			} else {
				targetEl.classList.add("invalid");
				targetEl.classList.remove("valid");
				targetEl.textContent = getError(input);
			}
		}
	}

	/**
	* Handles valid input by setting aria-invalid=false and updating the associated error/success message container if
	* it exists.
	* @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input - The valid form control.
	*/
	function handleValidInput(input) {
		input.setAttribute("aria-invalid", "false");
		const target = input.getAttribute("aria-describedby");
		if (target) {
			const targetEl = document.getElementById(target);
			if (!targetEl) {
				console.error(`element not found for aria-describedby="${target}"`);
			} else {
				targetEl.classList.add("valid");
				targetEl.classList.remove("invalid");
				targetEl.textContent = input.getAttribute("data-success") || "";
			}
		}
	}

	/**
	* Clears validation state from the input and clears the associated error/success message container if it exists.
	* @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input - The neutral/non-required form controlled.
	*/
	function clearValidation(input) {
		input.removeAttribute("aria-invalid");
		const target = input.getAttribute("aria-describedby");
		if (target) {
			const targetEl = document.getElementById(target);
			if (!targetEl) {
				console.error(`element not found for aria-describedby="${target}"`);
			} else {
				targetEl.classList.remove("invalid", "valid");
				targetEl.textContent = "";
			}
		}
	}

	/**
	* Attaches input validation event listeners.
	* @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input - The form control to validate.
	*/
	function applyValidator(input) {
		input.addEventListener("input", function() {
			if (!this.validity.valid) {
				handleInvalidInput(this);
			} else if (this.value.trim()) {
				handleValidInput(this);
			} else {
				clearValidation(this);
			}
		});
	}

	/**
	* Initialises validation on all forms with the data-validate attribute.
	*/
	function initValidators() {
		document.querySelectorAll("form[data-validate]").forEach((form) => {
			if (forms.has(form)) return;
			for (let el of form.elements) {
				if (tags.includes(el.tagName) && !el.hasAttribute("data-ignore")) {
					for (const attr of el.attributes) {
						if (attrs.includes(attr.name)) {
							applyValidator(el)
							break;
						}
					}
				}
			}
			forms.add(form);
		});
	}

	// start listening baby!
	document.addEventListener("DOMContentLoaded", () => {
		initValidators();
	}, { once: true });
})();
