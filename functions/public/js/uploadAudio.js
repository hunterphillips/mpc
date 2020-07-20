/***	Upload files
 * upload input
 * upload validation > file type/ size
 * fb storage handling
 * upload progress UI
 */

// TODO: seamless upload after instructions
// - show demo on page load for non auth user > until "don't show again"

const maxLength = 180; // max audio length (seconds)
const uploadIcon = $("#upload-span .upload"); // upload icon to click
const uploadInput = $("#upload-input"); // upload file input element
const progressContainer = $("#progressContainer");
const progressInput = $("#progressBar"); // upload progress bar
const stopUploadInstructions = $("#stopUploadInstructions");
let currentFile;

// Upload inital click
uploadIcon.click((e) => {
	if (!gameState.loggedIn) return showInputPopup(e, "login");

	// if demo hasn't been seen
	if (!gameState.hasSeenDemo) {
		stopUploadInstructions.show();
		return showInputPopup(e, "instructions");
	}
	if (uploadLimitReached()) return showInputPopup(e, "freeUploadLimit");

	return true;
});

// on upload input event > validate file type/size > upload to FB
// eslint-disable-next-line consistent-return
uploadInput.on("change", function (e) {
	let filePath = this.value;
	currentFile = e.target.files[0];
	if (!filePath || !currentFile) return showError("fileLoad");
	validateAudioFile(filePath, currentFile);
});

// error if file not .mp3 OR over max length
// eslint-disable-next-line consistent-return
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
		return uploadAudio(currentFile);
	};
	audio.src = URL.createObjectURL(file);
}

// upload audio file to FB storage
function uploadAudio(file) {
	let fileName = formatName(file.name) || "unnamed";
	let uid = auth.currentUser.uid;
	let storageRef = firebase.storage().ref(`fire_samples/${uid}/${fileName}`);
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
			console.log("upload successful");
			addSampleDropdownOption(storageRef, fileName, true);
			progressContainer.hide();
		}
	);
}

// format file name for db storage
function formatName(name) {
	return name.split(".")[0].substr(0, 24).trim();
}

// 'hide demo' click > update user 'hasSeenDemo' field in DB
stopUploadInstructions.click(() => {
	stopUploadInstructions.hide();
	myDB.collection("user-configs").doc(userID).set({
		seenDemo: true,
	});
	gameState.hasSeenDemo = true;
	uploadIcon.trigger("click");
});

// TODO:
// - update count on upload, show popup for unpaid user
function uploadLimitReached() {
	console.log(
		"customer & count",
		gameState.isCustomer,
		gameState.uploadCount,
		"\nlimit reached",
		gameState.uploadLimitReached,
		"seenDemo: ",
		gameState.hasSeenDemo
	);
	if (
		gameState.uploadLimitReached ||
		(!gameState.isCustomer && gameState.uploadCount > 0)
	) {
		if (!gameState.uploadLimitReached) gameState.uploadLimitReached = true;
		return true;
	} else {
		return false;
	}
}
