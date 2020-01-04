// TODO: json presets

const drumloops = ["jd89bpm", "db1", "db2", "db3"];

var songs = [
	"hotel-trim",
	"antla",
	"night",
	"drift",
	"leyla",
	"moonset",
	"antla-vox",
	"laura"
];
var playback = $("#playback");
var drums = $("#drumSelect");
var samples = $("#sampleSelect");

// add drumloop selection
addSounds(drums, drumloops);

// add sample selection
addSounds(samples, songs);

function addSounds(el, sounds) {
	sounds.forEach(sound => {
		el.append(`<option value="${sound}">${sound}</option>`);
	});
}
