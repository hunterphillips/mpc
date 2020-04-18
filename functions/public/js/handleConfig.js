//TODO: override vs save new

// configuration UI buttons, "configSelect" element variable already defined
const configSave = $("#configSave");
const configModal = $("#modal-config");
const configName = $("#configName"); // name input field
const cancelConfig = $("#modal-config .cancelBtn");
const editConfig = $("#editConfig");
const undoBtn = $("#undoIcon");
let currentConfig = {};

// hide Edit config btn unless custom config selected,
editConfig.hide();

// set current user configuration
configSave.click(() => {
	let config = {
		sound: samples.val(),
		playback: playback.val(),
		drums: drums.val(),
		regions: getRegionInfo(wavesurfer.regions.list)
	};
	Object.assign(currentConfig, config);
	saveUserConfig(); // save to DB
});

// close config modal
cancelConfig.click(() => {
	configModal.attr("style", "display: none");
});

// config select
configSelect.change(function() {
	let name = $(this).val();
	let settings = JSON.parse($("option:selected", this).attr("data-content"));
	currentConfig.id = $("option:selected", this).attr("data-id");
	configName.val(name); // add selected name to Name input
	editConfig.show(); // reveal edit btn
	gameState.lastSettings = settings; // track current settings
	setConfig(settings);
});

// undo changes (revert to last loaded settings)
undoBtn.click(() => {
	setConfig(gameState.lastSettings);
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

	//TODO: edit existing
	editConfig.click(() => {
		// currentConfig.id
		// "db.set()"
	});
}

// apply configuration settings
function setConfig(settings) {
	// dont change if none needed
	checkSetting(playback, settings.playback);
	checkSetting(drums, settings.drums);
	// always reset sample to reset Regions
	samples.val(settings.sound).trigger("change");
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
	gameState.configSelected = true;
}

// check if change is needed for a given setting > apply and trigger change
function checkSetting(element, newSetting) {
	if (element.val() !== newSetting) {
		element.val(newSetting).trigger("change");
	}
}
