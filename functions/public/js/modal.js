/**********    POPUP Modal
 * user login
 * upload instructions
 ****************/

const modalElement = $("#modal-1-content p");
const modalTitle = $("#modal-1-title");
var currentModalContent = modalElement.html();
const modalCloseBtn = $("#modalCloseBtn");

// set html content of info modal //TODO: ADD BACK default msgs
function modalMessage(msg) {
	const msgs = {
		login: `Please <code><a id="loginLink" href="/login">login</a></code> or create an account to upload sound files`,
		instructions: `Upload an <code>.mp3</code> file | 3 minute max length </br> We recommend using a tool like 
					   <a href="https://audiotrimmer.com/" target="_blank">Trimmer</a> to trim an audio file to your desired length
					   `,
		saveConfigPurchase: `Purchase additional storage to save your settings.</br><a id="buyNowBtn" href="/payments">Buy now</a>`,
		//TODO: remove
		saveConfigPurchaseDemo: `This will be a premium feature`,
		keyboardDemo: `Tap with a touch screen or use your keyboard to interact with the controller</br><div style="padding-top:.5em;"><img id='keyboardImg' src="img/keyboard_keys.png"></div>`,
		arrowKeysDemo: `Drag with your mouse or use the arrow keys to highlight and move the graph regions</br><div><img id='arrowKeyImg' src="img/arrowKeys.png"></div>`,
		//TODO: replace
		// freeUploadLimit: `Purchase a subscription for additional upload storage.</br><a id="buyNowBtn" href="/payments">Buy now</a>`,
		freeUploadLimit: `Additional storage will require a subscription, and it will be able to store all your hopes & dreams`,
		configLimit: `Bruh, you've saved like 100 of these. 100 exactly, actually. This is currently the maximum amount we support.`,
	};
	let content = msgs[msg];
	if (currentModalContent !== content) {
		modalElement.html(content);
		currentModalContent = content;
	}
}

// show popop modal with msg
function showInputPopup(inputEvent, msg, title) {
	title = title || false;
	// prevent input file select
	inputEvent.preventDefault();
	modalMessage(msg);
	MicroModal.show("modal-1");

	if (title) modalTitle.text(title);
}

// hide 'Don't show message again' button
modalCloseBtn.click(() => {
	stopUploadInstructions.hide();
});
