/** User Settings UI
 * edit - add - remove settings
 * save settings popup
 */

// TODO: remove, logged in check

// configuration UI buttons, "configSelectBtn" element variable already defined
const configSave = $("#configSave");
const configModal = $("#modal-config");
const cancelConfig = $("#modal-config .cancelBtn");
const undoBtn = $("#undoIcon");

// hide Edit config btn unless custom config selected,
editConfig.hide();

// set current user configuration
configSave.click(() => {
	if (!gameState.loggedIn) {
		return;
	}
	let config = {
		sound: samples.val(),
		playback: playback.val(),
		drums: drums.val(),
		regions: getRegionInfo(wavesurfer.regions.list),
	};
	Object.assign(currentConfig, config);
	saveUserConfig(); // save to DB
});

// extract needed info from wavesurfer regions.list for FB database
function getRegionInfo(regions) {
	let regionsData = [];

	for (let pad in regions) {
		regionsData.push({
			id: regions[pad].id,
			start: regions[pad].start,
			end: regions[pad].end,
			color: regions[pad].color,
		});
	}
	return JSON.stringify(regionsData);
}

// get Name for config > save to DB
function saveUserConfig() {
	keyboardOff(); // turn off keyboard mpc events
	// show modal
	configModal.attr("style", "display: contents");
	MicroModal.show("modal-config", {
		onClose: () => {
			console.log("close/add");
			configModal.attr("style", "display: none");
			keyboardOn();
			let name = configName.val().trim();
			if (name.length) {
				currentConfig.name = name;
				myDB.collection(`user-configs/${userID}/configs`).add(currentConfig);
			} else {
				showError("configName");
			}
		},
		closeTrigger: "data-custom-close",
	});
}

// Edit config > db.set()
editConfig.click(() => {
	configModal.attr("style", "display: none");
	keyboardOn();
	let name = configName.val().trim();
	if (name.length) {
		currentConfig.name = name;
		myDB
			.doc(`user-configs/${userID}/configs/${currentConfig.id}`)
			.set(currentConfig);
		// set option text to reflect new name
		$(`#configDropdown p[data-id='${currentConfig.id}']`).text(name);
		configSelectBtn.text(name);
	} else {
		showError("configName");
	}
});

// close config modal
cancelConfig.click(() => {
	configModal.attr("style", "display: none");
	keyboardOn();
});

// undo changes (revert to last loaded settings)
undoBtn.click(() => {
	setConfig(gameState.lastSettings);
	undoBtn.hide();
	gameState.undoVisible = false;
});
