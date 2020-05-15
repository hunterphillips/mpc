/** Remove user data
 *  samples
 *  configs
 */

// user sample delete
$("#sampleDropdown").on("click", ".del-icon", function (e) {
	e.stopPropagation();
	let target = $(this).parent().parent();
	let removedSample = target.attr("value");
	// storage item reference
	var storageSample = fbStorage.child(
		`fire_samples/${userID}/${removedSample}`
	);
	storageSample
		.delete()
		.then(() => {
			return console.log("storage item removed"); // TODO: success message
		})
		.catch((error) => {
			console.log(error);
			return showError("deleteError"); // TODO: add console.log to showError
		});
	// remove ui
	target.hide("slow", () => target.remove());
});

// user config delete
$("#configDropdown").on("click", ".del-icon", function (e) {
	// e.stopPropagation();
	e.stopImmediatePropagation();
	let target = $(this).parent().parent();
	let removedConfig = target.attr("data-id");
	// db document delete
	myDB
		.collection(`user-configs/${userID}/configs`)
		.doc(removedConfig)
		.delete()
		.then(() => {
			return; // TODO: success message
		})
		.catch((error) => {
			return console.error("Error removing document: ", error);
		});
	// remove ui
	target.hide("slow", () => target.remove());
});
