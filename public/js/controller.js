// TODO: upload

// static jquery selectors
var padContainer = $("#pad-container");
var volumeInput = $("#volumeInput");

// mpc pad objects
const keyMap = {
	d: { pad: "pad-1", pressed: false },
	f: { pad: "pad-2", pressed: false },
	g: { pad: "pad-3", pressed: false },
	h: { pad: "pad-4", pressed: false },
	c: { pad: "pad-5", pressed: false },
	v: { pad: "pad-6", pressed: false },
	b: { pad: "pad-7", pressed: false },
	n: { pad: "pad-8", pressed: false }
};

const keyList = Object.keys(keyMap);

/*
    Pad buttons
	keyboard/touch behavior
*/
padContainer.on("touchstart", ".pad", e => {
	let color = e.target.style.color;
	let targetPad = e.target.classList[1];
	$("." + targetPad).css("background", `radial-gradient(${color}, #2f2f2f)`);
	// play target region
	wavesurfer.regions.list[targetPad].play();
});

padContainer.on("touchend", ".pad", e => {
	$("." + e.target.classList[1]).css(
		"background",
		"radial-gradient(#232323, #2f2f2f)"
	);
});

// Pads (keyboard press)
$("body").keydown(e => {
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
});

$("body").keyup(e => {
	if (keyList.indexOf(e.key) > -1) {
		$("." + keyMap[e.key].pad).css(
			"background",
			"radial-gradient(#232323, #2f2f2f)"
		);
		keyMap[e.key].pressed = false;
		//wavesurfer.stop();
	}
});

/** Parameter Controllers **/

// Playback Speed select
playback.change(function() {
	wavesurfer.setPlaybackRate($(this).val());
});

// Volume
volumeInput.change(function() {
	let vol = $(this).val() / 100;
	wavesurfer.setVolume(vol);
});

// Drum select
drums.change(function() {
	$("#drumSource").attr("src", `/audio/drums/${$(this).val()}.mp3`);
	document.getElementById("drumAudio").load();
});
