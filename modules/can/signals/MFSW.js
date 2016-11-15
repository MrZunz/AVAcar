var util = require('util');
var EventEmitter = require('events').EventEmitter;
var mpd = require("../../mpd");

function MFSW() {
	this.id = "5C1";
	this.name = "MFSW";
	this.description = "Multi Functional Steering Wheel";
	this.value = null;
}

util.inherits(MFSW, EventEmitter);

MFSW.prototype.parse = function(bytes) {

	var byte1 = ("0" + bytes[0].toString(16)).substr(-2).toUpperCase();

	if(byte1 == this.value) {
		return;
	}		

	switch(byte1) {

		case this.buttons.None:
			//console.log('Button next!');
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'None' });
			break;

		case this.buttons.Next:
			//console.log('Button next!');
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'Next' });
			mpd.next(function(err, msg) { });
			break;

		case this.buttons.Previous:
			//console.log('Button previous!');
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'Previous' });
			mpd.previous(function(err, msg) { });
			break;
	}

	this.value = byte1;
}

// Enum
MFSW.prototype.buttons = Object.freeze({ 
	"None": "00",
	"Next": "02",
	"Previous": "03", 
	"VolumeUp": "06", 
	"VolumeDown": "07", 
	"Menu": "0A", 
	"Phone": "1A", 
	"SpeechRecognition": "2A", 
	"Up": "22", 
	"Down": "23", 
	"Ok": "28",
	"Mute": "2B", 
});

module.exports = exports = new MFSW();