function copyUserToken() {
	// Get the text field
	const copyText = document.getElementById('myInput');

	// Select the text field
	copyText.select();
	copyText.setSelectionRange(0, 99999); // For mobile devices

	// Copy the text inside the text field
	navigator.clipboard.writeText(copyText.value);

	// Alert the copied text
	alert('Token has been copied');
}

function ToggleTokenVisibility() {
	const x = document.getElementById('myInput');
	if (x.type === 'password') {
		x.type = 'text';
	} else {
		x.type = 'password';
	}
}
