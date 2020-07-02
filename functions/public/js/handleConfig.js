/** User Settings UI
 * edit - add - remove settings
 * save settings popup
 * select / apply config settings
 */

// configuration UI buttons, "configSelectBtn" "configSave" element variables already defined
const configModal = $("#modal-config");
const cancelConfig = $("#modal-config .cancelBtn");
const undoBtn = $("#undoIcon");

// hide Edit config btn unless custom config selected,
editConfig.hide();

// set current user configuration
configSave.click((e) => {
	if (!gameState.isCustomer) {
		showInputPopup(e, "saveConfigPurchase", "*Premium Feature*");
		return;
	}
	if (gameState.configCount > 99) {
		showInputPopup(e, "configLimit");
		return;
	}

	let config = {
		sound: sampleSelectBtn.val(),
		playback: playback.val(),
		drums: drums.val(),
		regions: getRegionInfo(wavesurfer.regions.list),
	};
	Object.assign(currentConfig, config);
	saveUserConfig(); // save to DB
});

// check
function configLimitReached() {
	return gameState.configCount > 49;
}

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
			configModal.attr("style", "display: none");
			keyboardOn();
			let name = configName.val().trim();
			if (name.length) {
				currentConfig.name = name;
				myDB
					.collection(`user-configs/${userID}/configs`)
					.add(currentConfig)
					.then((res) => {
						if (res.id) {
							let configObj = {
								settings: currentConfig,
								id: res.id,
								name: name,
							};
							addUserConfigs([configObj]);
						}
						return; // TODO: show success message
					})
					.catch((error) => {
						console.log(error);
						return showError("configSave");
					});
			} else showError("configName");
		},
		closeTrigger: "data-custom-close",
	});
}

// config select
configDropdown.on("click", ".config-option", function () {
	let name = $(this).attr("name");
	let settings = JSON.parse($(this).attr("data-content"));
	currentConfig.id = $(this).attr("data-id");
	configSelectBtn.text(name); // set selected name as button text
	configName.val(name); // add name to Name input on popup modal
	editConfig.show(); // reveal edit btn
	gameState.lastSettings = settings; // track current settings
	setConfig(settings);
});

// apply configuration settings
function setConfig(settings) {
	checkSetting(playback, settings.playback); // dont change if none needed
	checkSetting(drums, settings.drums);
	// always set sample to trigger reset Regions > click target dropdown option to trigger sample select functionality
	$(`#sampleDropdown p[value=${settings.sound}]`).trigger("click");
	sampleSelectBtn.text(settings.sound);
	let regions = JSON.parse(settings.regions);
	wavesurfer.on("ready", () => {
		wavesurfer.clearRegions();
		regions.forEach((region) => {
			wavesurfer.addRegion({
				id: region.id,
				start: region.start,
				end: region.end,
				color: region.color,
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
