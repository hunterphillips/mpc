/**********    POPUP Modal
 * user login
 * upload instructions
 ****************/

var modalElement = $("#modal-1-content p");
var currentModalContent = modalElement.html();

// set html content of info modal
function modalMessage(msg) {
	const msgs = {
		login: `Please <code><a id="loginLink" href="/login">login</a></code> or create an account to upload sound files`,
		instructions: `Upload an <code>.mp4</code> file | 90 second max length </br> You can use a tool like 
					   <a href="https://audiotrimmer.com/" target="_blank">Trimmer</a> to trim an audio file to your desired length
					   `
	};
	let content = msgs[msg];
	if (currentModalContent != content) {
		modalElement.html(content);
		currentModalContent = content;
	}
}

// show popop modal with msg
function showInputPopup(inputEvent, msg) {
	// prevent input file select
	inputEvent.preventDefault();
	modalMessage(msg);
	MicroModal.show("modal-1");
}
