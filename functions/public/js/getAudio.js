// TODO:  > 'add config' UI (name) > load config settings (wave settings)

const myDB = firebase.firestore(); // Firestore DB
const fbStorage = firebase.storage().ref(); // FB Storage
const configSelect = $("#configSelect"); // config select dropdown

// on user login > fetch/add user sounds > user configs
auth.onAuthStateChanged(fbUser => {
	if (fbUser) {
		const uid = fbUser.uid;
		const userStorage = fbStorage.child(`fire_samples/${uid}`);
		// Find all the prefixes and items.
		userStorage
			.listAll()
			.then(res => {
				return addUserSamples(uid, res.items);
			})
			.catch(error => {
				console.log("User storage error ", error);
			});
		myDB // get db collections TODO: uid
			.collection(`user-configs/${userID}/configs`)
			.get()
			.then(snapshot => {
				// return console.log("USER CONFIGS", snapshot.docs);
				return addUserConfigs(snapshot.docs);
			})
			.catch(error => {
				console.log("get collections error ", error);
			});
	} else {
		//
	}
});

// add each user sample as an <option> to 'samples' select dropdown
function addUserSamples(userID, sounds) {
	sounds.forEach(sound => {
		let name = sound.name;
		fbStorage
			.child(`fire_samples/${userID}/${name}`)
			.getDownloadURL()
			.then(url => {
				return samples.append(
					`<option value="${name}" url="${url}">${name}</option>`
				);
			})
			.catch(error => {
				console.log(error);
			});
	});
}

// add user cofigs to 'Saved' dropdown
function addUserConfigs(configDocs) {
	configDocs.forEach(doc => {
		let docID = doc.id;
		let name = doc.data().name;
		let settings = JSON.stringify(doc.data());
		configSelect.append(
			`<option data-id="${docID}" data-content='${settings}'>${name}</option>`
		);
	});
}
