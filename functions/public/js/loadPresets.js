/**********    Load default sounds
 * drums, samples
 * set initial volume
 ****************/

var drumloops = [
	"jd89bpm",
	"db1",
	"db2",
	"db3",
	"break1",
	"break2",
	"break3",
	"trap1",
	"trap2",
	"trap3",
];

var songs = [
	"hotel-trim",
	"antla",
	"night",
	"drift",
	"leyla",
	"moonset",
	"antla-vox",
	"laura",
];
const playback = $("#playback");
const drums = $("#drumSelect");
const drumAudio = $("#drumAudio");
const samples = $("#sampleSelect");

// add drumloop selection
addSounds(drums, drumloops, "option");

// add sample selection
addSounds(sampleDropdown, songs, "p");

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
