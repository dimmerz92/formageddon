import { beforeEach, describe, it, expect } from "vitest";
import { setup, fire } from "./helpers.js";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("data-confirm validation", () => {
  function setupConfirm() {
    const { form, get } = setup(`
			<input id="password" type="password" required />
			<input id="confirm" type="password" data-confirm="#password" aria-describedby="msg" />
			<span id="msg"></span>
		`);
    return {
      form,
      password: get("#password"),
      confirm: get("#confirm"),
      msg: get("#msg"),
    };
  }

  it("shows an error when the confirm field does not match the origin", () => {
    const { password, confirm, msg } = setupConfirm();
    password.value = "secret";
    confirm.value = "different";
    fire(confirm, "blur");
    expect(confirm.getAttribute("aria-invalid")).toBe("true");
    expect(msg.textContent).toBe("Values do not match.");
  });

  it("shows a custom confirm error message", () => {
    const { get } = setup(`
			<input id="pw" type="password" />
			<input type="password" data-confirm="#pw" data-confirm-err="Passwords must match." aria-describedby="msg" />
			<span id="msg"></span>
		`);
    const pw = get("#pw");
    const confirm = get("[data-confirm]");
    pw.value = "abc";
    confirm.value = "xyz";
    fire(confirm, "blur");
    expect(get("#msg").textContent).toBe("Passwords must match.");
  });

  it("is valid when both fields match", () => {
    const { password, confirm } = setupConfirm();
    password.value = "secret";
    confirm.value = "secret";
    fire(confirm, "blur");
    expect(confirm.getAttribute("aria-invalid")).toBe("false");
  });

  it("is cleared when the confirm field is empty and not required", () => {
    const { password, confirm } = setupConfirm();
    password.value = "secret";
    confirm.value = "";
    fire(confirm, "blur");
    expect(confirm.hasAttribute("aria-invalid")).toBe(false);
  });

  it("re-validates the confirm field when the origin changes", () => {
    const { password, confirm } = setupConfirm();
    password.value = "abc";
    confirm.value = "abc";
    fire(confirm, "input");
    expect(confirm.getAttribute("aria-invalid")).toBe("false");

    // Change the origin - confirm should become invalid without touching it
    password.value = "xyz";
    fire(password, "input");
    expect(confirm.getAttribute("aria-invalid")).toBe("true");
  });
});
