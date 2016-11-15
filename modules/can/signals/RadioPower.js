var util = require('util');
var EventEmitter = require('events').EventEmitter;

function RadioPower() {
	this.id = "661";
	this.name = "RadioPower";
	this.description = "Radio power";
	this.value = null;
}

util.inherits(RadioPower, EventEmitter);

RadioPower.prototype.parse = function(bytes) {

	var byte1 = ("0" + bytes[0].toString(16)).substr(-2).toUpperCase(); 			

	if(byte1 == this.value) {
		return;
	}

	switch(byte1) {
		case this.state.On:
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'On' });
			break;
		case this.state.Off:
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'Off' });
			break;
	}

	this.value = byte1;
}

// Enum
RadioPower.prototype.state = Object.freeze({ 
	"On": "03",
	"Off": "00",
});

module.exports = exports = new RadioPower();