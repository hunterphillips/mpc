/***	Upload files
 * upload input
 * upload validation > file type/ size
 * fb storage handling
 * upload progress UI
 */
// TODO: check user auth

var hasSeenDemo = false; // track if upload instructions have displayed
const maxLength = 90; // max audio length (seconds)
const uploadIcon = $("#upload-span .upload"); // upload icon to click
const uploadInput = $("#upload-input"); // upload file input element
const progressContainer = $("#progressContainer");
const progressInput = $("#progressBar"); // upload progress bar

// Upload inital click
uploadIcon.click((e) => {
	if (!gameState.loggedIn) return showInputPopup(e, "login");

	// if demo hasn't been seen
	if (!hasSeenDemo) {
		showInputPopup(e, "instructions");
		hasSeenDemo = true;
	}
	return true;
});

// on upload input event > validate file type/size > upload to FB
uploadInput.on("change", function (e) {
	let filePath = this.value;
	let file = e.target.files[0];
	if (!filePath || !file) return showError("fileLoad");
	if (!validateAudioFile(filePath, file)) return false;
	return uploadAudio(file);
});

// error if file not .mp3 OR over max length
function validateAudioFile(filePath, file) {
	let regx = /(?:\.([^.]+))?$/;
	var ext = regx.exec(filePath)[1];
	if (ext !== "mp3") return showError("fileType");

	// create audio element to read duration property
	var audio = document.createElement("audio");
	audio.preload = "metadata";

	audio.onloadedmetadata = function () {
		// release existing object URL created by calling URL.createObjectURL()
		window.URL.revokeObjectURL(audio.src);
		if (audio.duration > maxLength) {
			return showError("fileLength");
		}
		return true;
	};
	audio.src = URL.createObjectURL(file);
	return true;
}

// upload audio file to FB storage
function uploadAudio(file) {
	let fileName = formatName(file.name) || "unnamed";
	let userID = auth.currentUser.uid;
	let storageRef = firebase.storage().ref(`fire_samples/${userID}/${fileName}`);
	let uploadTask = storageRef.put(file);
	// show progress UI (overlay and progress bar)
	progressContainer.show();
	uploadTask.on(
		"state_changed",
		(snapshot) => {
			// upload progress UI
			let percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			progressInput.val(percentage);
		},
		(err) => {
			console.log("UPLOAD ERROR ", err);
			progressContainer.hide();
		},
		() => {
			// TODO: upload complete UI > add option > select new option
			console.log("COMPLETED");
			addSampleDropdownOption(storageRef, fileName, true);
			progressContainer.hide();
		}
	);
}

// format file name for db storage
function formatName(name) {
	return name.split(".")[0].substr(0, 24).trim();
}
