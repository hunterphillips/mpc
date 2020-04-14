//TODO: override vs save new

// configuration UI buttons, "configSelect" element variable already defined
const configSave = $("#configSave");
const configModal = $("#modal-config");
const configName = $("#configName"); // name input field
const cancelConfig = $("#modal-config .cancelBtn");
let currentConfig = {};

// set current user configuration
configSave.click(() => {
	let config = {
		sound: samples.val(),
		playback: playback.val(),
		drums: drums.val(),
		regions: getRegionInfo(wavesurfer.regions.list)
	};
	currentConfig = config;
	saveUserConfig(); // save to DB
});

// close config modal
cancelConfig.click(() => {
	console.log("config save cancelled");
	configModal.attr("style", "display: none");
});

// config select
configSelect.change(function() {
	let configName = $(this).val();
	let configID = $("option:selected", this).attr("data-id");
	let settings = JSON.parse($("option:selected", this).attr("data-content"));
	setConfig(settings);
});

// extract needed info from wavesurfer regions.list for FB database
function getRegionInfo(regions) {
	let regionsData = [];

	for (let pad in regions) {
		regionsData.push({
			id: regions[pad].id,
			start: regions[pad].start,
			end: regions[pad].end,
			color: regions[pad].color
		});
	}
	return regionsData;
}

// get Name for config > save to DB
function saveUserConfig() {
	configModal.attr("style", "display: contents"); // show modal

	MicroModal.show("modal-config", {
		onClose: () => {
			configModal.attr("style", "display: none");
			let name = configName.val().trim();
			if (name.length) {
				currentConfig.name = name;
				let configJson = JSON.stringify(currentConfig); // convert configObj to JSON for db storage
				myDB.collection(`user-configs/${userID}/configs`).add(configJson);
			} else showError("configName");
		},
		closeTrigger: "data-custom-close"
	});
}

// apply configuration settings
function setConfig(settings) {
	samples.val(settings.sound).trigger("change");
	playback.val(settings.playback).trigger("change");
	drums.val(settings.drums).trigger("change");
	// wave regions
	wavesurfer.on("ready", () => {
		wavesurfer.clearRegions();
		settings.regions.forEach(region => {
			wavesurfer.addRegion({
				id: region.id,
				start: region.start,
				end: region.end,
				color: region.color
			});
		});
	});
}
