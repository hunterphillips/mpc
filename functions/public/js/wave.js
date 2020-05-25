/**********    WaveSurfer Init
 * load wave graph for initial sound
 * add wave Regions
 * add corresponding controller pads
 ****************/

// check if Mobile device (if media queries active)
var is_mobile = false;

if ($("#upload-span").css("display") === "none") {
	is_mobile = true;
}

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
	// divide wave graph into n equal sections corresponding to n mpc pads
	let numberOfRegions = is_mobile ? 6 : 8;
	var interval = Math.round((duration * 0.9) / numberOfRegions);
	addRegions(interval, numberOfRegions);
	// add mpc pads to HTML if not already
	if ($("#pad-container").is(":empty")) addPads(numberOfRegions);
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
function addRegions(interval, numberOfRegions) {
	for (let i = 0; i < numberOfRegions; i++) {
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
function addPads(numPads) {
	for (let i = 0; i < numPads; i++) {
		let color = "hsla(" + i * 50 + ", 75%, 30%, 0.9)";

		$("#pad-container").append(
			`<div class='pad pad-${i + 1}' style='color:${color}'></div>`
		);
	}
}
