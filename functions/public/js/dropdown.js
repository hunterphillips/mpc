/**     Dropdowns
 * Sample select
 * Configuration select
 */

const configSelectBtn = $("#configSelectToggle");
const sampleSelectBtn = $("#sampleSelectToggle");
const configDropdown = $("#configDropdown");
const sampleDropdown = $("#sampleDropdown");

// toggle between hiding and showing the dropdown content
configSelectBtn.click(() => {
	configDropdown.toggle();
});

sampleSelectBtn.click(() => {
	sampleDropdown.toggle();
});

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
	if (!event.target.matches(".dropbtn")) {
		configDropdown.hide();
		sampleDropdown.hide();
	}
};
