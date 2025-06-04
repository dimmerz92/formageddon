<div align="center">
    <img src="/assets/formageddon.png" alt="formageddon banner"/>
    <h1>Formageddon</h1>
    <p><b>Because unvalidated forms require an act of God.</b></p>
    <br>
    <p>A tiny, framework-agnostic HTML form validation <s>micro</s> nano-framework.</p>
    <p><b>Zero dependencies. No build step. Just drop it in.</b></p>
</div>


## Features

- ⚡ Tiny and fast
- 🧩 Works with native HTML5 validation
- 🔍 Accessible by default (uses `aria-describedby`, `aria-invalid`)
- ✨ Fully declarative using data attributes
- 🧼 No framework, no bundler, no build
- 🛠 Zero dependencies

## Size

- Unminified 10 KB (gzipped ~2.8 KB)
- Minified 4.0 KB (gzipped ~1.5 KB)

## Interactive Playground

[Formageddon playground](https://dimmerz92.github.io/formageddon/docs/web/)

## Getting Started

### 1. Include the script

```html
<script src="formageddon.js" defer></script>
```

### 2. Add `data-validate` to your form

```html
<form data-validate>
    ...
</form>
```

### 3. Add native HTML validation and `data-*-err` for custom error messages

```html
<input
    type="email"
    data-type-err="Must be a valid email"
    required
    data-required-err="Email required"
/>
```

### 4. Reference error display targets with `aria-describedby`

```html
<input ... aria-describedby="email-error">
<small id="email-error"></small>
```

### 5. Optionally style valid and invalid inputs and messages

```css
:where(input[aria-invalid="true"], .invalid){
    border-color: red;
}

:where(input[aria-invalid="false"], .valid) {
    border-color: green;
}
```

## Custom Error Messages

You can customise validation error messages by adding data attributes to your input elements. Below are all supported validity states, the corresponding attribute you can use, and the default message if none is provided:

| Validity State               | Attribute          | Default Error Message                          |
|------------------------------|--------------------|------------------------------------------------|
| valueMissing                 | data-required-err  | This field is required.                        |
| typeMismatch                 | data-type-err      | The value is not the correct type.             |
| patternMismatch              | data-pattern-err   | The value does not match the required pattern. |
| tooLong                      | data-maxlength-err | The value is too long.                         |
| tooShort                     | data-minlength-err | The value is too short.                        |
| rangeOverflow                | data-max-err       | The value is too large.                        |
| rangeUnderflow               | data-min-err       | The value is too small.                        |
| stepMismatch                 | data-step-err      | The value does not match the step interval.    |
| badInput                     | data-type-err      | The input value is invalid.                    |
| invalid file accept (custom) | data-accept-err    | Invalid file type.                             |
| success (custom)             | data-success       |                                                |

Example:

```html
<input type="email" required data-required-err="Email is mandatory" data-type-err="Please enter a valid email address" />
```

## Accessibility

Formageddon uses:
- aria-invalid to signal input validity
- aria-describedby to link inputs to associated error/success messages

This ensures screen readers can communicate validation status effectively.

## Installation

### Browser drop in - local

```html
<script src="formageddon.js" defer></script>
```

### Browser drop in - CDN

Coming soon.

### NPM
```bash
npm install formageddon
```

## License

MIT - [LICENSE]("/LICENSE")

## Contributing

Issues and PRs are welcome! 
