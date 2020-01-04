"use strict";

// TODO: initial state?  upload sample

let initialState = true;

// instance of the global WaveSurfer object
var wavesurfer = WaveSurfer.create({
	container: "#waveform",
	waveColor: "#e2e2e3",
	progressColor: "purple",
	responsive: true,
	//
	plugins: [WaveSurfer.regions.create({})]
});

// initialize sound file
wavesurfer.load("/audio/pastels.mp3");

// update wave on sample selection
samples.change(function() {
	let newSong = $(this).val();
	wavesurfer.empty();
	wavesurfer.clearRegions();
	wavesurfer.load(`/audio/${newSong}.mp3`);
});

// once file is loaded
wavesurfer.on("ready", () => {
	// get duration, divide into regions
	var duration = wavesurfer.getDuration();
	var interval = Math.round((duration * 0.9) / 8);

	addRegions(interval);

	if (initialState) addPads();
});

// set wave regions
function addRegions(interval) {
	for (let i = 0; i < 8; i++) {
		let startTime = i * interval;
		let endTime = startTime + interval;
		wavesurfer.addRegion({
			id: "pad-" + (i + 1),
			start: startTime,
			end: endTime,
			color: "hsla(" + i * 50 + ", 75%, 30%, 0.25)"
		});
	}
}

// add drum pad html element and assign a color for each pad
function addPads() {
	let pads = [1, 2, 3, 4, 5, 6, 7, 8];
	pads.forEach((pad, index) => {
		//
		let color = "hsla(" + index * 50 + ", 75%, 30%, 0.9)";

		$("#pad-container").append(
			`<div class='pad pad-${pad}' style='color:${color}'></div>`
		);
	});
	initialState = false;
}
