/**********    Load default sounds
 * drums, samples
 * set initial volume
 ****************/

const playback = $("#playback");
const drums = $("#drumSelect");
const drumAudio = $("#drumAudio");
const samples = $("#sampleSelect");

// fetch default sounds > add drums and samples to select inputs
getLocalSounds();
function getLocalSounds() {
	return fetch("/getDefaultSounds", {
		method: "get",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((res) => {
			return res.json();
		})
		.then((result) => {
			drumAudio.prop("volume", 0.8);
			addSounds(sampleDropdown, result.samples, "p");
			return addSounds(drums, result.drums, "option");
		})
		.catch((err) => {
			console.log("Error retrieving sounds", err);
		});
}

// set inital drum volume
drumAudio.prop("volume", 0.5);

function addSounds(el, sounds, elementType) {
	sounds.forEach((sound) => {
		let child = document.createElement(elementType);
		let text = document.createTextNode(sound);
		child.setAttribute("value", sound);
		child.setAttribute("url", `/audio/${sound}.mp3`);
		child.append(text);
		el.append(child);
	});
}

// track if 'undo' btn should be visible
function checkUndoBtn() {
	if (gameState.configSelected && !gameState.undoVisible) {
		undoBtn.show();
		gameState.undoVisible = true;
	}
}
