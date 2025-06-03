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

	// gets custom defined error if it exists, otherwise returns a default.
	function getError(input) {
		for (const [key, obj] of Object.entries(errors)) {
			if (input.validity[key]) {
				return input.getAttribute(obj.attr) || obj.default;
			}
		}
		return "";
	}
})();
