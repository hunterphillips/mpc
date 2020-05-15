/**********    WaveSurfer Init
 * load wave graph for initial sound
 * add wave Regions
 * add corresponding controller pads
 ****************/

// instance of the global WaveSurfer object
var wavesurfer = WaveSurfer.create({
	container: "#waveform",
	waveColor: "#e2e2e3",
	progressColor: "purple",
	responsive: true,
	plugins: [WaveSurfer.regions.create({})],
});

// initialize sound file
wavesurfer.load("/audio/pastels.mp3");

// update wave on sample selection //.find(':selected').attr('isred');
$("#sampleDropdown").on("click", "p", function () {
	let newSong = $(this).attr("url");
	let name = $(this).attr("value");
	sampleSelectBtn.text(name);
	sampleSelectBtn.attr("value", name);
	loadSample(newSong);
	checkUndoBtn();
});

// once file is loaded > get duration, divide into regions
wavesurfer.on("ready", () => {
	var duration = wavesurfer.getDuration();
	// divide wave graph into '8' equal sections corresponding to the 8 mpc pads
	var interval = Math.round((duration * 0.9) / 8);
	addRegions(interval);
	// add mpc pads to HTML if not already
	if ($("#pad-container").is(":empty")) addPads();
});

// on Region edit > show 'undo' btn if needed
wavesurfer.on("region-updated", () => {
	checkUndoBtn();
});

// load new WaveSurfer file
function loadSample(path) {
	wavesurfer.empty();
	wavesurfer.clearRegions();
	wavesurfer.load(`${path}`);
}

// set wave regions
function addRegions(interval) {
	for (let i = 0; i < 8; i++) {
		let startTime = i * interval;
		let endTime = startTime + interval;
		wavesurfer.addRegion({
			id: "pad-" + (i + 1),
			start: startTime,
			end: endTime,
			color: "hsla(" + i * 50 + ", 75%, 30%, 0.25)",
		});
	}
}

// add drum pad html element and assign a color for each pad
function addPads() {
	let pads = [1, 2, 3, 4, 5, 6, 7, 8];
	pads.forEach((pad, index) => {
		let color = "hsla(" + index * 50 + ", 75%, 30%, 0.9)";

		$("#pad-container").append(
			`<div class='pad pad-${pad}' style='color:${color}'></div>`
		);
	});
}
