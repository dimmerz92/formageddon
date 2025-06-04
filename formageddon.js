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
	* Validates form controls with the data-confirm attribute.
	* @param {HTMLInputElement} input - The form control to validate.
	* @returns {boolean} True if all control matches origin, false otherwise.
	*/
	function isValidConfirm(input) {
		const origin = input.getAttribute("data-confirm");
		if (!origin) return true;

		const originEl = document.querySelector(origin);
		if (!originEl) {
			console.error(`element not found for data-confirm=${origin}`);
			return false;
		}

		return input.value === originEl.value;
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

		// validate for data-confirm
		if (input.hasAttribute("data-confirm")) {
			if (input.value.trim() && !isValidConfirm(input)) {
				return input.getAttribute("data-confirm-err") || "Values do not match.";
			}
			return "";
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
	* Handles the disabling of the form submit control if it has the data-submit attribute
	 * @param {HTMLFormElement} form - The form the submit control is within
	 * @param {HTMLInputElement|HTMLButtonElement} submit - The submit control to toggle disabled
	 */
	function handleFormSubmitControl(form, submit) {
		if (form.checkValidity() && form.querySelectorAll("[aria-invalid=true]").length === 0) {
			submit.disabled = false;
		} else {
			submit.disabled = true;
		}
	}

	/**
	* Validates a form control and sets appropriate aria-invalid and error/success messages.
	* @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input - The form control to validate.
	*/
	function validateInput(input) {
		if (!isValidConfirm(input) || !input.validity.valid) {
			handleInvalidInput(input);
		} else if (input.value.trim()) {
			handleValidInput(input);
		} else {
			clearValidation(input);
		}
	}

	/**
	* Attaches input validation event listeners.
	* @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input - The form control to validate.
	*/
	function applyValidator(input) {
		input.addEventListener("input", () => validateInput(input));

		if (input.hasAttribute("data-confirm")) {
			const origin = input.getAttribute("data-confirm");
			if (!origin) {
				console.error("data-confirm attribute set without origin reference");
				return
			}

			const originEl = document.querySelector(origin);
			if (!originEl) {
				console.error(`element not found for data-confirm=${origin}`);
				return
			}

			originEl.addEventListener("input", () => validateInput(input));
		}
	}


	/**
	 * @param {HTMLFormElement} form 
	 * @param {HTMLInputElement|HTMLButtonElement} submit 
	 */
	function applySubmitValidator(form, submit) {
		if (!["INPUT", "BUTTON"].includes(submit.tagName) || submit.type !== "submit") {
			console.error("submission button expected to be of type input or button with type=submit")
			return
		}

		handleFormSubmitControl(form, submit);
		form.addEventListener("input", () => handleFormSubmitControl(form, submit));
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
				if (el.hasAttribute("data-submit")) {
					applySubmitValidator(form, el);
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
