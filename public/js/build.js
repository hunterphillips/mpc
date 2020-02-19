// TODO: json presets

const drumloops = [
	"jd89bpm",
	"db1",
	"db2",
	"db3",
	"break1",
	"break2",
	"break3",
	"trap1",
	"trap2",
	"trap3"
];

var songs = [
	"hotel-trim",
	"antla",
	"mystic",
	"night",
	"drift",
	"leyla",
	"moonset",
	"antla-vox",
	"laura",
	"Luciani",
	"magic land",
	"Le Tapis"
];
var playback = $("#playback");
var drums = $("#drumSelect");
var drumAudio = $("#drumAudio");
var samples = $("#sampleSelect");

// add drumloop selection
addSounds(drums, drumloops);

// add sample selection
addSounds(samples, songs);

// set inital drum volume
drumAudio.prop("volume", 0.5);

function addSounds(el, sounds) {
	sounds.forEach(sound => {
		el.append(`<option value="${sound}">${sound}</option>`);
	});
}
