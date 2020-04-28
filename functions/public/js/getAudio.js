/***
 *
 */

const myDB = firebase.firestore(); // Firestore DB
const fbStorage = firebase.storage().ref(); // FB Storage
const editConfig = $("#editConfig");
const configName = $("#configName"); // name input field
let currentConfig = {};
var configOption;

toggleConfigSelect(false);

// on user login > fetch/add user sounds > user configs
auth.onAuthStateChanged((fbUser) => {
	if (fbUser) {
		const uid = fbUser.uid;
		const userStorage = fbStorage.child(`fire_samples/${uid}`);
		// Find all the prefixes and items.
		userStorage
			.listAll()
			.then((res) => {
				return addUserSamples(uid, res.items);
			})
			.catch((error) => {
				console.log("User storage error ", error);
			});
		myDB // get db collections
			.collection(`user-configs/${userID}/configs`)
			.get()
			.then((snapshot) => {
				return addUserConfigs(snapshot.docs);
			})
			.catch((error) => {
				console.log("get collections error ", error);
			});
		// enable config select button
		toggleConfigSelect(true);
	} else {
		//
	}
});

// add each user sample as an <option> to 'samples' select dropdown
function addUserSamples(userID, sounds) {
	sounds.forEach((sound) => {
		let name = sound.name;
		fbStorage
			.child(`fire_samples/${userID}/${name}`)
			.getDownloadURL()
			.then((url) => {
				return sampleDropdown.append(
					`<p value="${name}" url="${url}">${name}<span><img class="mpcIcon del-icon" src="img/remove.png"/></span></p>`
				);
				// return samples.append(
				// 	`<option value="${name}" url="${url}">${name}</option>`
				// );
			})
			.catch((error) => {
				console.log(error);
			});
	});
}

// add user cofigs to 'Saved' dropdown
function addUserConfigs(configDocs) {
	configDocs.forEach((doc) => {
		let docID = doc.id;
		let name = doc.data().name;
		let settings = JSON.stringify(doc.data());
		configDropdown.append(
			`<p data-id="${docID}" data-content='${settings}' class="config-option" name="${name}">${name}</p>`
		);
	});
	// set listener on config dropdown options
	setConfigSelectCallback();
}

// toggle configSelect button (enable if user logged in)
function toggleConfigSelect(enable) {
	if (enable) {
		configSelectBtn.css({
			color: "aquamarine",
			opacity: 1,
			"pointer-events": "inherit",
		});
	} else {
		configSelectBtn.css({
			color: "gainsboro",
			opacity: 0.5,
			"pointer-events": "none",
		});
	}
}

// config select behavior
function setConfigSelectCallback() {
	configOption = $(".config-option");
	configOption.click(function (e) {
		let name = $(this).attr("name");
		let settings = JSON.parse($(this).attr("data-content"));
		currentConfig.id = $(this).attr("data-id");
		configSelectBtn.text(name); // set selected name as button text
		configName.val(name); // add name to Name input on popup modal
		editConfig.show(); // reveal edit btn
		gameState.lastSettings = settings; // track current settings
		setConfig(settings);
	});
}

// apply configuration settings
function setConfig(settings) {
	checkSetting(playback, settings.playback); // dont change if none needed
	checkSetting(drums, settings.drums);
	// always set sample to trigger reset Regions > click target dropdown option to trigger sample select functionality
	$(`#sampleDropdown p[value=${settings.sound}]`).trigger("click");
	sampleSelectBtn.text(settings.sound);
	let regions = JSON.parse(settings.regions);
	wavesurfer.on("ready", () => {
		console.log("wave region stuff");
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
