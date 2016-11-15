var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Handbrake() {
	this.id = "621";
	this.name = "Handbrake";
	this.description = "Handbrake";
	this.value = null;
}

util.inherits(Handbrake, EventEmitter);

Handbrake.prototype.parse = function(bytes) {

	var byte1 = ("0" + bytes[0].toString(16)).substr(-2).toUpperCase(); 			

	if(byte1 == this.value) {
		return;
	}

	switch(byte1) {
		case this.state.Engaged:
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'Engaged' });
			break;
		case this.state.Disengaged:
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'Disengaged' });
			break;
	}

	this.value = byte1;
}

// Enum
Handbrake.prototype.state = Object.freeze({ 
	"Engaged": "22",
	"Disengaged": "02",
});

module.exports = exports = new Handbrake();