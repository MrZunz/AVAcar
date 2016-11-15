var util = require('util');
var EventEmitter = require('events').EventEmitter;

function RPM() {
	this.id = "35B";
	this.name = "RPM";
	this.description = "RPM";
	this.value = null;
}

util.inherits(RPM, EventEmitter);

RPM.prototype.parse = function(bytes) {

	var byte1 = ("0" + bytes[0].toString(16)).substr(-2).toUpperCase();

	if(byte1 == this.value) {
		return;
	}		

	// switch(byte1) {

	// }

	this.value = byte1;
}

// Enum
RPM.prototype.stuff = Object.freeze({ 
	"None": "00",
});

module.exports = exports = new RPM();