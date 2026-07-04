import "../formageddon.js";

export const F = globalThis.Formageddon;

export function setup(html) {
	const form = document.createElement("form");
	form.innerHTML = html;
	document.body.appendChild(form);
	F.initForm(form);
	return {
		form,
		get: (selector) => form.querySelector(selector),
	};
}

export function fire(el, type) {
	el.dispatchEvent(new Event(type, { bubbles: true }));
}

export function flushObserver() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}
