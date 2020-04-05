// TODO: add retrieved storage items to sample dropdown... > play selected

const soundStorage = firebase.storage().ref();

// on user login > fetch/add user sounds
auth.onAuthStateChanged(fbUser => {
	if (fbUser) {
		// get user's audio files
		const uid = fbUser.uid;
		const userStorage = soundStorage.child(`fire_samples/${uid}`);
		// Find all the prefixes and items.
		userStorage
			.listAll()
			.then(res => {
				res.items.forEach(item => {
					console.log("storage item? ", item);
					let name = item.name;
					let path = item.fullPath;
					samples.append(
						`<option value="${name}" url="${path}">${name}</option>`
					);
				});
				return;
			})
			.catch(error => {
				console.log("User storage error ", error);
			});
	} else {
		//
	}
});
