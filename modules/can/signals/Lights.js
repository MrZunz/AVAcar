var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Lights() {
	this.id = "531";
	this.name = "Lights";
	this.description = "Lights";
	this.value = null;
}

util.inherits(Lights, EventEmitter);

Lights.prototype.parse = function(bytes) {

	var byte2 = ("0" + bytes[1].toString(16)).substr(-2).toUpperCase();

	if(byte2 == this.value) {
		return;
	}

	switch(byte2) {
		case this.state.LeftBlinkers:
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'LeftBlinkers' });
			break;
		case this.state.RightBlinkers:
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'RightBlinkers' });
			break;
		case this.state.AllBlinkers:
			this.emit('signal', { id: this.id, name: this.name, description: this.description, value: 'AllBlinkers' });
			break;
	}

	this.value = byte2;
}

// Enum
Lights.prototype.state = Object.freeze({ 
	"LeftBlinkers": "11",
	"RightBlinkers": "12",
	"AllBlinkers": "13",
});

module.exports = exports = new Lights();