const demoBtn = $("#demoBtn");
const nextBtn = $("#controllerDemoNext");

//
demoBtn.on("click", (e) => {
	showInputPopup(e, "keyboardDemo", "Pad controls");
	nextBtn.show();
});

//
nextBtn.click((e) => {
	showInputPopup(e, "arrowKeysDemo", "Region controls");
	nextBtn.hide();
});
