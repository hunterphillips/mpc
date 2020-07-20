/**********    MPC controller
 * pad touch behavior
 * map keyboard keys to controller
 * playback rate, volume, drum audio inputs
 ****************/

const padContainer = $("#pad-container");
const volumeInput = $("#volumeInput");

// mpc pad objects > [keyboard key] : { pad }
const keyMap = {
	f: { pad: "pad-1", pressed: false },
	g: { pad: "pad-2", pressed: false },
	h: { pad: "pad-3", pressed: false },
	j: { pad: "pad-4", pressed: false },
	v: { pad: "pad-5", pressed: false },
	b: { pad: "pad-6", pressed: false },
};

// add 7th & 8th pads if not mobile device
if (!is_mobile) {
	keyMap.n = { pad: "pad-7", pressed: false };
	keyMap.m = { pad: "pad-8", pressed: false };
}

const keyList = Object.keys(keyMap);

/*
    Pad buttons
	keyboard/touch behavior
*/

// disable context menu ('right click' ie 2 finger touch)
padContainer.contextmenu(() => false);

// light up touched pad > play region
padContainer.on("touchstart", ".pad", (e) => {
	let color = e.target.style.color;
	let targetPad = e.target.classList[1];
	$("." + targetPad).css("background", `radial-gradient(${color}, #2f2f2f)`);
	// play target region
	wavesurfer.regions.list[targetPad].play();
});
// remove pad background color on touch release
padContainer.on("touchend", ".pad", (e) => {
	$("." + e.target.classList[1]).css(
		"background",
		"radial-gradient(#232323, #2f2f2f)"
	);
});

// show keyboard info no padContainer click
padContainer.click((e) => {
	showInputPopup(e, "keyboardDemo", "Pad contols");
});

// Pads (keyboard press)
keyboardOn();
// wrap in function to turn keyboard events on/off
function keyboardOn() {
	$("body").keydown((e) => {
		if (keyList.indexOf(e.key) > -1) {
			let color = $("." + keyMap[e.key].pad).css("color");
			$("." + keyMap[e.key].pad).css(
				"background",
				`radial-gradient(${color}, #2f2f2f)`
			);

			// prevent repeat events
			if (keyMap[e.key].pressed) return;
			keyMap[e.key].pressed = true;

			let targetPad = keyMap[e.key].pad;
			wavesurfer.regions.list[targetPad].play();
		}
		if (e.code === "Space") toggleDrums();
	});

	$("body").keyup((e) => {
		if (keyList.indexOf(e.key) > -1) {
			$("." + keyMap[e.key].pad).css(
				"background",
				"radial-gradient(#232323, #2f2f2f)"
			);
			keyMap[e.key].pressed = false;
		}
	});
}

// turn off keyboard mpc
function keyboardOff() {
	$("body").off("keydown keyup");
}

/** Parameter Controllers **/

// Playback Speed select
playback.change(function () {
	wavesurfer.setPlaybackRate($(this).val());
	// check if config selected > show undo btn
	checkUndoBtn();
});

// Volume
volumeInput.change(function () {
	let vol = $(this).val() / 100;
	wavesurfer.setVolume(vol);
});

// Drum select
drums.change(function () {
	$("#drumSource").attr("src", `/audio/drums/${$(this).val()}.mp3`);
	document.getElementById("drumAudio").load();
	checkUndoBtn();
});

// Play/Pause Drum audio
function toggleDrums() {
	return drumAudio.prop("paused")
		? drumAudio.trigger("play")
		: drumAudio.trigger("pause");
}
