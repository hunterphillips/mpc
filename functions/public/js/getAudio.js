/*** Get user audio
 * samples
 * configs
 */

// myDB, fbStorage already defined
const editConfig = $("#editConfig");
const configName = $("#configName"); // name input field
const configSave = $("#configSave"); // save config btn
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
				gameState.uploadCount = res.items.length || 0;
				return addUserSamples(uid, res.items);
			})
			.catch((error) => {
				console.log("User storage error ", error);
			});
		myDB // get db collections
			.collection(`user-configs/${userID}/configs`)
			.get()
			.then((snapshot) => {
				if (snapshot.docs.length > 0) {
					gameState.configCount = snapshot.docs.length;
					toggleConfigSelect(true);
					return addUserConfigs(snapshot.docs);
				} else {
					return toggleConfigSelect();
				}
			})
			.catch((error) => {
				console.log("get collections error ", error);
			});
	}
});

// add user sounds
function addUserSamples(userID, sounds) {
	sounds.forEach((sound) => {
		let name = sound.name;
		let storageRef = fbStorage.child(`fire_samples/${userID}/${name}`);
		addSampleDropdownOption(storageRef, name);
	});
}

// add <option> to 'samples' select dropdown > autoSelect default false, if true select the added sample
function addSampleDropdownOption(storageRef, name, autoSelect = false) {
	storageRef
		.getDownloadURL()
		.then((url) => {
			sampleDropdown.append(
				`<p value="${name}" url="${url}" class="user-sample ">${name}<span><img class="mpcIcon del-icon" src="img/remove.png"/></span></p>`
			);
			return setSample(name, autoSelect);
		})
		.catch((error) => {
			console.log(error);
		});
}

// select sample
function setSample(name, execute) {
	if (execute) {
		$(`#sampleDropdown p[value=${name}]`).trigger("click");
		sampleSelectBtn.text(name);
	}
}

// add user cofigs to 'Saved' dropdown
function addUserConfigs(configDocs) {
	configDocs.forEach((doc) => {
		let docID = doc.id;
		let name = doc.data ? doc.data().name : doc.name;
		let settings = doc.data
			? JSON.stringify(doc.data())
			: JSON.stringify(doc.settings);
		configDropdown.append(
			`<p data-id="${docID}" data-content='${settings}' class="config-option" name="${name}">${name}<span><img class="mpcIcon del-icon" src="img/remove.png"/></span></p>`
		);
	});
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
	if (!gameState.loggedIn) {
		configSave.css({
			color: "gainsboro",
			opacity: 0.5,
			"pointer-events": "none",
		});
	} else {
		configSave.css({
			color: "aquamarine",
			opacity: 1,
			"pointer-events": "inherit",
		});
	}
}
