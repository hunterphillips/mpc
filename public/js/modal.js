// MicroModal.init({onShow, onClose,...});

// track if upload instructions have displayed
localStorage.setItem("seenDemo", "false");
var hasSeenDemo = localStorage.getItem("seenDemo");
// upload icon to click
var uploadIcon = $("#upload-span .upload");

// Upload file
uploadIcon.click(function(e) {
	// if demo hasn't been seen
	if (!(hasSeenDemo == "true")) {
		// prevent input file select, show upload modal
		e.preventDefault();
		MicroModal.show("modal-1");
		localStorage.setItem("seenDemo", "true");
	}
});

var uploadInput = $("#upload-input");
// non-dom allocated Audio element > used to get sound file (length)
var noDomAudio = document.createElement("audio");
var fileReader = new FileReader();

// error message if wrong file type
uploadInput.change(function(uploadEvent) {
	let ext = this.value.match(/\.([^\.]+)$/)[1];
	if (ext != "mp3") {
		return showError("fileType");
	}
	let target = uploadEvent.currentTarget;
	let file = target.files[0];

	if (file) fileReader.readAsDataURL(file);
});

// When uploaded file has been succesfully read
fileReader.onload = e => {
	noDomAudio.src = e.target.result;
};
// if file couldn't be read
fileReader.onerror = event => {
	console.error("An error ocurred reading the file: ", event);
	showError("fileLoad");
};

// error if duration over max length
noDomAudio.addEventListener("loadedmetadata", () => {
	var duration = parseInt(noDomAudio.duration);
	console.log(duration);
	if (duration > 30) showError("fileLength");
});

// fade in/out error div
function showError(err) {
	$("#fileError").html(errorMsgs[err]);
	$("#fileError")
		.fadeIn()
		.delay(4500)
		.fadeOut();
	return false;
}

// store errors by type
var errorMsgs = {
	fileType: `File type error. Please select an <code>.mp3</code> file no longer than 90 seconds.`,
	fileLength: `Audio duration limit. Please select an audio file under <code>90</code> seconds in length.`,
	fileLoad: `Hmm, there was an error reading that file.`
};

localStorage.clear();
