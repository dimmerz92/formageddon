<div align="center">
  <img src="/assets/formageddon.png" alt="Formageddon" />
  <h1>Formageddon</h1>
  <p><b>Because unvalidated forms require an act of God.</b></p>
  <br>
  <p>A tiny, framework-agnostic HTML form validation script.</p>
  <p><b>Zero dependencies. No build step. Just drop it in.</b></p>
  <br>
  <a href="https://dimmerz92.github.io/formageddon/docs/"><b>Try the live playground →</b></a>
</div>

---

## Size

~3.2 KB minified, ~1.7 KB gzipped.

## Quick start

```html
<!-- 1. Include the script -->
<script src="formageddon.js" defer></script>

<!-- 2. Mark your form -->
<form data-validate>

  <!-- 3. Add native validation attributes + optional custom error messages -->
  <input
    type="email"
    required
    data-required-err="Email is required."
    data-type-err="Enter a valid email address."
    data-success="Looks good!"
    aria-describedby="email-msg"
  />
  <small id="email-msg"></small>

  <!-- 4. Optionally auto-manage the submit button -->
  <button type="submit" data-submit>Submit</button>

</form>
```

## Installation

**Browser drop-in:**
```html
<script src="formageddon.js" defer></script>
```

**npm:**
```bash
npm install formageddon
```

## Features

- Builds on the native [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) - no duplicate logic
- `aria-invalid` and `aria-describedby` for out-of-the-box accessibility
- Custom error and success messages per validity state via `data-*` attributes
- File `accept` validation (browsers don't expose this in the Validity API)
- Confirm-field matching via `data-confirm`
- Submit button auto-enable/disable via `data-submit`
- Reset clears all validation state
- Dynamic forms and late-appended inputs supported via `MutationObserver`
- Safe to call `Formageddon.initForm(form)` manually at any time

## Attribute reference

### Form and field control

| Attribute | On | Purpose |
|---|---|---|
| `data-validate` | `<form>` | Enables auto-initialisation |
| `data-ignore` | any field | Skips validation for this field |
| `data-submit` | `<button type="submit">` | Auto-disables until the form is valid |
| `data-confirm="#id"` | any field | Value must match the referenced element |
| `data-success` | any field | Message shown when the field is valid |

### Custom error messages

| Validity state | Attribute | Default |
|---|---|---|
| `valueMissing` | `data-required-err` | This field is required. |
| `typeMismatch` | `data-type-err` | The value is not the correct type. |
| `patternMismatch` | `data-pattern-err` | The value does not match the required pattern. |
| `tooShort` | `data-minlength-err` | The value is too short. |
| `tooLong` | `data-maxlength-err` | The value is too long. |
| `rangeUnderflow` | `data-min-err` | The value is too small. |
| `rangeOverflow` | `data-max-err` | The value is too large. |
| `stepMismatch` | `data-step-err` | The value does not match the step interval. |
| `badInput` | `data-type-err` | The input value is invalid. |
| File `accept` | `data-accept-err` | Invalid file type. |
| Confirm mismatch | `data-confirm-err` | Values do not match. |

## Validation behaviour

- Fires on `input`, `change`, and `blur` events
- Disabled and read-only fields are never validated
- Non-required fields with an empty value are left in a neutral state - no `aria-invalid`, no message
- On form reset, all validation state and messages are cleared automatically

## Styling

Formageddon sets `aria-invalid="true"` or `"false"` on the field, and adds `.invalid` or `.valid` to the linked message element. No CSS is shipped - style to taste:

```css
:is(input, select, textarea)[aria-invalid="true"]  { border-color: #ef4444; }
:is(input, select, textarea)[aria-invalid="false"] { border-color: #22c55e; }

.invalid { color: #ef4444; }
.valid   { color: #22c55e; }
```

Works seamlessly with [Pico CSS](https://picocss.com/), where `<small>` elements under inputs serve as natural message containers.

## Accessibility

- `aria-invalid` signals validity state to assistive technology
- `aria-describedby` links inputs to their error/success message elements
- Screen readers announce validation feedback automatically

## License

[MIT](LICENSE)

## Contributing

Issues and PRs are welcome.
