const Formageddon = (() => {
  "use strict";

  /** @type {WeakSet<HTMLFormElement>} */
  const initialisedForms = new WeakSet();

  /** @type {WeakSet<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>} */
  const initialisedInputs = new WeakSet();

  /** @type {WeakSet<HTMLInputElement|HTMLButtonElement>} */
  const initialisedSubmits = new WeakSet();

  /** @type {string[]} */
  const tags = ["INPUT", "TEXTAREA", "SELECT"];

  /** @type {string[]} */
  const attrs = [
    "accept",
    "min",
    "max",
    "step",
    "minlength",
    "maxlength",
    "pattern",
    "required",
    "data-confirm",
  ];

  /** @type {string[]} */
  const validationEvents = ["input", "change", "blur"];

  /** @type {Record<string, {attr: string, default: string}>} */
  const errors = {
    valueMissing: {
      attr: "data-required-err",
      default: "This field is required.",
    },
    typeMismatch: {
      attr: "data-type-err",
      default: "The value is not the correct type.",
    },
    patternMismatch: {
      attr: "data-pattern-err",
      default: "The value does not match the required pattern.",
    },
    tooLong: {
      attr: "data-maxlength-err",
      default: "The value is too long.",
    },
    tooShort: {
      attr: "data-minlength-err",
      default: "The value is too short.",
    },
    rangeOverflow: {
      attr: "data-max-err",
      default: "The value is too large.",
    },
    rangeUnderflow: {
      attr: "data-min-err",
      default: "The value is too small.",
    },
    stepMismatch: {
      attr: "data-step-err",
      default: "The value does not match the step interval.",
    },
    badInput: {
      attr: "data-type-err",
      default: "The input value is invalid.",
    },
  };

  /** @type {[string, {attr: string, default: string}][]} - Pre-computed to avoid recreating on every validation */
  const errorEntries = Object.entries(errors);

  /**
   * Validates file inputs against the accept attribute.
   * The browser does not reflect accept violations in the Validity API, so this must be checked manually.
   * @param {HTMLInputElement} input
   * @returns {boolean}
   */
  function isValidAccept(input) {
    const accept = input.getAttribute("accept");
    if (!accept || !accept.trim() || !input.files || !input.files.length)
      return true;

    const acceptedTypes = accept.split(",").map((s) => s.trim().toLowerCase());

    for (const file of input.files) {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();

      const matched = acceptedTypes.some((type) => {
        if (type.startsWith(".")) return fileName.endsWith(type);
        if (type.endsWith("/*")) return fileType.startsWith(type.slice(0, -1));
        return fileType === type;
      });

      if (!matched) return false;
    }

    return true;
  }

  /**
   * Validates a data-confirm field against its origin element.
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
   * @returns {boolean}
   */
  function isValidConfirm(input) {
    const selector = input.getAttribute("data-confirm");
    if (!selector) return true;

    const origin = document.querySelector(selector);
    if (!origin) {
      console.warn(
        `Formageddon: element not found for data-confirm="${selector}"`,
      );
      return false;
    }

    // An empty non-required confirm field is not a mismatch
    if (!input.required && !input.value.trim()) return true;

    return input.value === origin.value;
  }

  /**
   * Returns the appropriate error message for the current validity state of an input.
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
   * @returns {string}
   */
  function getError(input) {
    const value = input.value.trim();

    // Use files.length rather than value, jsdom and some edge cases leave value empty for file inputs
    if (
      input.type === "file" &&
      input.hasAttribute("accept") &&
      input.files &&
      input.files.length &&
      !isValidAccept(input)
    ) {
      return input.getAttribute("data-accept-err") || "Invalid file type.";
    }

    if (input.hasAttribute("data-confirm")) {
      if (value && !isValidConfirm(input)) {
        return input.getAttribute("data-confirm-err") || "Values do not match.";
      }
      // Fall through to native validity (e.g. required when the confirm field is empty)
    }

    for (const [key, obj] of errorEntries) {
      if (input.validity[key]) {
        return input.getAttribute(obj.attr) || obj.default;
      }
    }

    return "";
  }

  /**
   * Returns the element referenced by aria-describedby, if any.
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
   * @returns {HTMLElement|null}
   */
  function getMessageElement(input) {
    const id = input.getAttribute("aria-describedby");
    if (!id) return null;

    const el = document.getElementById(id);
    if (!el)
      console.warn(
        `Formageddon: element not found for aria-describedby="${id}"`,
      );

    return el;
  }

  /**
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
   */
  function handleInvalidInput(input) {
    input.setAttribute("aria-invalid", "true");
    const target = getMessageElement(input);
    if (target) {
      target.classList.add("invalid");
      target.classList.remove("valid");
      target.textContent = getError(input);
    }
  }

  /**
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
   */
  function handleValidInput(input) {
    input.setAttribute("aria-invalid", "false");
    const target = getMessageElement(input);
    if (target) {
      target.classList.add("valid");
      target.classList.remove("invalid");
      target.textContent = input.getAttribute("data-success") || "";
    }
  }

  /**
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
   */
  function clearValidation(input) {
    input.removeAttribute("aria-invalid");
    const target = getMessageElement(input);
    if (target) {
      target.classList.remove("invalid", "valid");
      target.textContent = "";
    }
  }

  /**
   * @param {HTMLFormElement} form
   * @param {HTMLInputElement|HTMLButtonElement} submit
   */
  function handleFormSubmitControl(form, submit) {
    const allValid =
      form.checkValidity() &&
      form.querySelectorAll("[aria-invalid=true]").length === 0;
    submit.disabled = !allValid;
  }

  /**
   * @param {Event & { target: HTMLFormElement }} event
   */
  function handleFormReset(event) {
    for (const el of event.target.elements) {
      if (tags.includes(el.tagName)) clearValidation(el);
    }
  }

  /**
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
   */
  function validateInput(input) {
    if (input.disabled) return;
    if (
      (input instanceof HTMLInputElement ||
        input instanceof HTMLTextAreaElement) &&
      input.readOnly
    )
      return;

    // isValidAccept must be checked explicitly - the browser does not reflect accept violations in validity
    if (
      !isValidConfirm(input) ||
      !input.validity.valid ||
      !isValidAccept(input)
    ) {
      handleInvalidInput(input);
      return;
    }

    // File inputs expose selected files via .files, not .value, so check both
    const hasValue =
      input.type === "file"
        ? !!(input.files && input.files.length)
        : !!input.value.trim();

    if (hasValue) {
      handleValidInput(input);
    } else {
      clearValidation(input);
    }
  }

  /**
   * Attaches validation event listeners to a form control.
   * Guarded by initialisedInputs to prevent duplicate listeners when initForm is called more than once.
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} input
   */
  function applyValidator(input) {
    if (initialisedInputs.has(input)) return;
    initialisedInputs.add(input);

    validationEvents.forEach((event) =>
      input.addEventListener(event, () => validateInput(input)),
    );

    if (input.hasAttribute("data-confirm")) {
      const selector = input.getAttribute("data-confirm");
      if (!selector) {
        console.warn("Formageddon: data-confirm set without a selector value");
        return;
      }

      const origin = document.querySelector(selector);
      if (!origin) {
        console.warn(
          `Formageddon: element not found for data-confirm="${selector}"`,
        );
        return;
      }

      // Re-validate the confirm field whenever the origin changes
      validationEvents.forEach((event) =>
        origin.addEventListener(event, () => validateInput(input)),
      );
    }
  }

  /**
   * @param {HTMLFormElement} form
   * @param {HTMLInputElement|HTMLButtonElement} submit
   */
  function applySubmitValidator(form, submit) {
    if (
      !["INPUT", "BUTTON"].includes(submit.tagName) ||
      submit.type !== "submit"
    ) {
      console.warn(
        "Formageddon: data-submit expected on an input[type=submit] or button[type=submit]",
      );
      return;
    }

    if (initialisedSubmits.has(submit)) return;
    initialisedSubmits.add(submit);

    handleFormSubmitControl(form, submit);
    validationEvents.forEach((event) =>
      form.addEventListener(event, () => handleFormSubmitControl(form, submit)),
    );
  }

  /**
   * Initialises validation on a form.
   * Safe to call multiple times - all helpers are guarded against duplicates.
   * @param {HTMLFormElement} form
   */
  function initForm(form) {
    // Only attach the reset listener the first time this form is seen
    let resetAttached = initialisedForms.has(form);

    for (const el of form.elements) {
      if (tags.includes(el.tagName) && !el.hasAttribute("data-ignore")) {
        if (attrs.some((attr) => el.hasAttribute(attr))) {
          applyValidator(el);
        }
      }

      if (el.hasAttribute("data-submit")) {
        applySubmitValidator(form, el);
      }

      if (!resetAttached && el.type === "reset") {
        form.addEventListener("reset", handleFormReset);
        resetAttached = true;
      }
    }

    initialisedForms.add(form);
  }

  /**
   * Scans the document for all forms with data-validate and initialises them.
   */
  function initValidators() {
    document.querySelectorAll("form[data-validate]").forEach((form) => {
      if (!initialisedForms.has(form)) initForm(form);
    });
  }

  const observer = new MutationObserver((mutationList) => {
    const formQueue = new Set();

    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        // Check the added node itself AND all descendants.
        // querySelectorAll alone misses the node when it is a form or control added directly.
        for (const el of [node, ...node.querySelectorAll("*")]) {
          if (el.tagName === "FORM" && el.hasAttribute("data-validate")) {
            formQueue.add(el);
          } else if (tags.includes(el.tagName)) {
            const form = el.closest("form");
            if (form && form.hasAttribute("data-validate")) {
              formQueue.add(form);
            }
          }
        }
      }
    }

    for (const form of formQueue) {
      initForm(form);
    }
  });

  /**
   * Scans for existing forms and starts the MutationObserver.
   * Called automatically on DOMContentLoaded (or immediately if the DOM is already ready).
   * Can also be called manually if the script is loaded dynamically after the document is ready.
   */
  function init() {
    initValidators();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  return { init, initForm };
})();

// Expose as a browser global and support test/module environments
globalThis.Formageddon = Formageddon;
