// populate the text editor
const editor = document.getElementById("editor");
editor.value = `<form data-validate>
	<label>
		Input validation
		<input
			type="text"
			name="original"
			aria-describedby="inputError"
			minlength="4"
			data-minlength-err="At least 4 characters are required."
			required
		/>
		<small id="inputError"></small>
	</label>

	<label>
		Confirmation input validation
		<input
			type="text"
			aria-describedby="input2Error"
			data-confirm="[name=original]"
		/>
		<small id="input2Error"></small>
	</label>

	<label>
		Select validation
		<select
			aria-describedby="selectError"
			data-required-err="A selection is required."
			required
		>
			<option value="" selected></option>
			<option>1</option>
			<option>2</option>
		</select>
		<small id="selectError"></small>
	</label>

	<label>
		Texarea validation
		<textarea
			aria-describedby="textareaError"
			minlength="2"
			required
		></textarea>
		<small id="textareaError"></small>
	</label>
</form>`

// iframe logic
const preview = document.getElementById("preview");
function initPreview() {
	const doc = preview.contentDocument || preview.contentWindow.document;
	doc.open();
	doc.write()
	doc.write(`<!DOCTYPE html>
<html lang="en">
	<head>
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" />
		<link rel="stylesheet" href="style.css" />
		<script src="../formageddon.min.js" defer><\/script>
	</head>
	<body id="iframe">
		<article id="content"></article>
	</body>
</html>`);
	doc.close();
}

function updatePreview() {
	const doc = preview.contentDocument || preview.contentWindow.document;
	const container = doc.getElementById("content");
	if (container) container.innerHTML = editor.value;
}

initPreview();
updatePreview();
editor.addEventListener("input", updatePreview);
