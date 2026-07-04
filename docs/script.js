const templates = {
  basic: `<form data-validate>
  <label for="name">
    Full name
    <input
      id="name"
      type="text"
      required
      data-required-err="Please enter your name."
      data-success="Looks good!"
      aria-describedby="name-msg"
    >
    <small id="name-msg"></small>
  </label>

  <label for="email">
    Email address
    <input
      id="email"
      type="email"
      required
      data-required-err="Email is required."
      data-type-err="Please enter a valid email address."
      data-success="Email looks good!"
      aria-describedby="email-msg"
    >
    <small id="email-msg"></small>
  </label>

  <button type="submit" data-submit>Submit</button>
</form>`,

  registration: `<form data-validate>
  <label for="reg-email">
    Email
    <input
      id="reg-email"
      type="email"
      required
      data-required-err="Email is required."
      data-type-err="Enter a valid email address."
      data-success="Email looks good!"
      aria-describedby="reg-email-msg"
    >
    <small id="reg-email-msg"></small>
  </label>

  <label for="password">
    Password
    <input
      id="password"
      type="password"
      required
      minlength="8"
      data-required-err="Password is required."
      data-minlength-err="Password must be at least 8 characters."
      aria-describedby="password-msg"
    >
    <small id="password-msg"></small>
  </label>

  <label for="confirm">
    Confirm password
    <input
      id="confirm"
      type="password"
      data-confirm="#password"
      data-confirm-err="Passwords do not match."
      aria-describedby="confirm-msg"
    >
    <small id="confirm-msg"></small>
  </label>

  <button type="submit" data-submit>Create account</button>
</form>`,

  profile: `<form data-validate>
  <label for="age">
    Age (18–120)
    <input
      id="age"
      type="number"
      min="18"
      max="120"
      step="1"
      required
      data-required-err="Age is required."
      data-min-err="Must be at least 18."
      data-max-err="Must be 120 or under."
      data-step-err="Whole numbers only."
      aria-describedby="age-msg"
    >
    <small id="age-msg"></small>
  </label>

  <label for="country">
    Country
    <select
      id="country"
      required
      data-required-err="Please select a country."
      aria-describedby="country-msg"
    >
      <option value="">- Select -</option>
      <option>Australia</option>
      <option>New Zealand</option>
      <option>United Kingdom</option>
      <option>United States</option>
    </select>
    <small id="country-msg"></small>
  </label>

  <label for="bio">
    Bio (10–200 characters)
    <textarea
      id="bio"
      minlength="10"
      maxlength="200"
      required
      data-required-err="Bio is required."
      data-minlength-err="At least 10 characters required."
      aria-describedby="bio-msg"
    ></textarea>
    <small id="bio-msg"></small>
  </label>

  <button type="submit" data-submit>Save profile</button>
</form>`,

  file: `<form data-validate>
  <label for="gallery">
    Photo gallery
    <input
      id="gallery"
      type="file"
      webkitdirectory
      required
      accept="image/*"
      data-required-err="Please select a folder."
      data-accept-err="All files in the folder must be images."
      data-success="All images - ready to upload!"
      aria-describedby="gallery-msg"
    >
    <small id="gallery-msg">Select a folder - any non-image file will trigger an error.</small>
  </label>

  <button type="submit" data-submit>Upload gallery</button>
</form>`,
};

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const templateBtns = document.querySelectorAll(".template-btn");

let debounceTimer = null;

function updatePreview() {
  preview.innerHTML = editor.value;
}

function scheduleUpdate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updatePreview, 280);
}

editor.addEventListener("keydown", (e) => {
  if (e.key !== "Tab") return;
  e.preventDefault();
  const { selectionStart: s, selectionEnd: end } = editor;
  editor.value = editor.value.slice(0, s) + "  " + editor.value.slice(end);
  editor.selectionStart = editor.selectionEnd = s + 2;
});

editor.addEventListener("input", scheduleUpdate);
preview.addEventListener("submit", (e) => e.preventDefault());

templateBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.template;
    if (!templates[key]) return;
    editor.value = templates[key];
    updatePreview();
    templateBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

editor.value = templates.basic;
updatePreview();
