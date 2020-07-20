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

// track selected region
let regionIdList = [];
let selectedRegion = {};
const regionObj = {
	id: "",
	selectedIndex: "",
};

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
	// max region coverage at 2 min
	if (duration > 140) duration = 140;
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

// play region on Dbl Click
wavesurfer.on("region-dblclick", (e) => {
	e.play();
});

// highlight clicked region > store selected region id
wavesurfer.on("region-click", (e) => {
	if (regionObj.id !== e.id) {
		e.element.style.border = "3px solid rgb(131, 167, 228)";
		// remove highlight from previous region
		if (regionObj.id.length) {
			$(`[data-id="${regionObj.id}"]`)[0].style.border = "none";
		}
		regionObj.id = e.id;
		regionObj.selectedIndex = findSelectedRegionIndex(regionObj.id);
	}
	if (selectedRegion !== e) {
		selectedRegion = e;
	}
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
	regionIdList = Object.keys(wavesurfer.regions.list);
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

// UP & DOWN arrow events > move selected region
document.onkeydown = function (e) {
	let key = e.keyCode;
	if (key === 38 || key === 40) {
		if (regionObj.id.length) {
			// add negative if LEFT key
			selectedRegion.onDrag(key === 40 ? -0.2 : 0.2);
		}
	}
	// L & R arrow events > select next region
	if (key === 37 || key === 39) {
		let regionID = regionObj.id.length ? regionObj.id : regionIdList[0];

		let regionIndex = findSelectedRegionIndex(regionID);

		// remove highlight from previous region
		$(`[data-id="${regionID}"]`)[0].style.border = "none";

		// update selected region params
		regionObj.selectedIndex = arrowSelectRegionIndex(regionIndex, key);
		// use index to get ID from idList
		// use id to match 'wavesurfer.regions.list' object key
		selectedRegion =
			wavesurfer.regions.list[regionIdList[regionObj.selectedIndex]];

		regionObj.id = selectedRegion.id;
		// highlight new region
		$(`[data-id="${regionObj.id}"]`)[0].style.border =
			"3px solid rgb(131, 167, 228)";
	}
};

// handle choosing next index on arrow key event
function arrowSelectRegionIndex(previousIndex, keyCode) {
	let newIndex = "";
	if (previousIndex === 0 && keyCode === 37) {
		newIndex = regionIdList.length - 1;
	} else if (previousIndex === regionIdList.length - 1 && keyCode === 39) {
		newIndex = 0;
	} else {
		newIndex = previousIndex += keyCode === 37 ? -1 : 1;
	}
	return newIndex;
}

// find array index with ID
function findSelectedRegionIndex(regionID) {
	return regionIdList.findIndex((id) => {
		return id === regionID;
	});
}

// remove selectedRegion if the user clicks outside of the waveform
window.onclick = function (event) {
	if (!event.target.matches("#waveform") && regionObj.id.length) {
		$(`[data-id="${regionObj.id}"]`)[0].style.border = "none";
		regionObj.id = "";
	}
};
