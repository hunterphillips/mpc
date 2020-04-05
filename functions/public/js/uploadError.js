// store errors by type
var errorMsgs = {
	fileType: `File type error. Please select an <code>.mp3</code> file no longer than 90 seconds.`,
	fileLength: `Audio duration limit. Please select an audio file under <code>90</code> seconds in length.`,
	fileLoad: `Hmm, there was an error reading that file.`
};

// fade in/out error div
function showError(err) {
	$("#fileError").html(errorMsgs[err]);
	$("#fileError")
		.fadeIn()
		.delay(4500)
		.fadeOut();
	return false;
}
