// Required modules
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var PIDS = require('./pids');

// Constructor
function OBD() {
	//this.btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
	this.deviceName = "ubuntu-0"; // OBDII
	this.connected = false;
	this.lastCommand = "";
	this.receivedData = "";
	this.queue = [];
	this.supportedPIDs = [];

	// The PIDS to keep polling
	this.poll = [];
	// this.poll.push("0104"); // Engine load
	this.poll.push("010C"); // RPM
	this.poll.push("010D"); // Speed
	// this.poll.push("010E"); // Timing advance relative to #1 cylinder
	this.poll.push("0111"); // Throttle position

	this.cache = {};
}

// Inherit 'on' and 'emit' functions
util.inherits(OBD, EventEmitter);

OBD.prototype.autoconnect = function () {
	var self = this; //Enclosure

	var query = this.deviceName;
	var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
	var search = new RegExp(query.replace(/\W/g, ''), 'gi');

	btSerial.on('found', function (address, name) {
		var addrMatch = !query || address.replace(/\W/g, '').search(search) != -1;
		var nameMatch = !query || name.replace(/\W/g, '').search(search) != -1;

		if (addrMatch || nameMatch || name == "ubuntu-0" || name == "OBDII") {

			btSerial.removeAllListeners('finished');
			btSerial.removeAllListeners('found');
			self.emit('debug', 'Found device: ' + name + ' (' + address + ')');

			btSerial.findSerialPortChannel(address, function (channel) {

				self.emit('debug', 'Found device channel: ' + channel);
				self.connect(address, channel);

			}, function (err) {
				console.log("Error finding serialport: " + err);
				btSerial.close();
				self.autoconnect();
			});
		} 
		else {
			self.emit('debug', 'Ignoring device: ' + name + ' (' + address + ')');
		}
	});

	btSerial.on('finished', function () {
		self.emit('failure', 'No suitable devices found');
	});

	btSerial.on('failure', function (err) {
		self.emit('failure', err);
	});

	btSerial.inquire();
}

OBD.prototype.connect = function (address, channel) {
	var self = this;

	var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();

	btSerial.connect(address, channel, function () {
		self.connected = true;
		console.log("Connected to", address, "on channel", channel + "!");

		btSerial.on('data', function (data) {
			//console.log("Received data:", data.toString('utf8'));
			self.parseData(data);
		});

		btSerial.on('failure', function (error) {
			console.log("Error with OBD-II device:", error);
			setTimeout(self.autoconnect.bind(self), 1000);
		});

		setTimeout(self.initialize.bind(self), 1000);
		//self.initialize();

	}, function (err) { //Error callback!
		console.log('Error connecting:', err);
		setTimeout(self.autoconnect.bind(self), 1000);
	});

	this.btSerial = btSerial;
};

OBD.prototype.parseData = function(data) {
	var self = this;
	
	data = data.toString('utf8').replace(/\r?\n|\r/g, '');

	// if it does not end with > then the whole message has not been returned yet
	if(data.indexOf('>', data.length - '>'.length) == -1) {
		//console.log("Data does not end with >", data);
		self.receivedData += data;
		self.processing = true;
	}
	else {
		// it does end with a > so we assume the message has been returned
		//console.log("Data does end with >", data);
		self.receivedData += data;

		if(!self.lastCommand) {
			console.log("Not parsing OBD data due to unexpected data:", self.receivedData);
		}
		else {
			var d = self.parseOBDCommand(self.receivedData);
		
			if(d.name && d.name.startsWith("pidsupp")) {  //21-40  pidsupp2 20 + 0C 

				for(var i = 0; i < d.value.length; i++) {
					var value = (Number(d.name.slice(-1) + "0") + parseInt(d.value[i], 16)).toString(16).toUpperCase();
					var pid = value.length == 1 ? "0" + value : value;
					self.supportedPIDs.push(d.mode + pid);
				}

				//console.info("supportedPIDs:", self.supportedPIDs);
			}
			else {
				console.log("Parsed response:", d);
			}

			this.cache[d.mode + d.pid] = d.value;
			self.emit('data', d);

			if(d.mode + d.pid == self.lastCommand.value) {
				//console.log("Reply is same as last command sent!");
				if(self.lastCommand.loop) {
					self.write(self.lastCommand.value, true);
				}
			}
			
		}

		self.processing = false;
		self.receivedData = "";
		self.processQueue();
		//self.processInput();
	}
}

OBD.prototype.write = function (command, loop) {

	if(loop == null) { loop = false; }

	var command = { value: command, loop: loop };
	this.queue.push(command);

	if(this.queue.length == 1 && !this.processing) {
		this.processQueue();
	}
};

OBD.prototype.processQueue = function() {
	var self = this;

	if(!this.connected || this.queue.length == 0 || this.processing) {
		return;
	}

	var command = this.queue.shift();
	command.value = command.value.replace(' ', '').toUpperCase();
	console.log(command);

	// incase the command is a PID check if it is supported
	if(!command.value.startsWith("AT") && !this.isPIDSupported(command.value)) {
		console.log("PID", command.value, "is NOT supported!");
		return;
	}

	this.processing = true;
	this.lastCommand = command;

	this.btSerial.write(new Buffer(command.value + "\r", "utf-8"), function (err, bytes) {
		if (err) { console.log("error writing:", err); }
		if(!err) { console.log("written", command.value); }
		
	});
}

OBD.prototype.parseOBDCommand = function(hexString) {	

	if(hexString.startsWith("BUS INIT: ...OK")) {
		this.initialized = true;
		hexString = hexString.replace("BUS INIT: ...OK", "");
		console.log("Response starts with BUS INIT: ...OK");
	}
	else if(hexString.startsWith("BUS INIT: ...ERROR")) {
		this.initialized = false;
		hexString = hexString.replace("BUS INIT: ...ERROR", "");
		console.log("Response starts with BUS INIT: ...ERROR");
		console.log("COMMUNICATION FAILURE! Trying to init the bus again...");

		this.btSerial.close();
		this.autoconnect(this.deviceName);
	}
	
	console.log("Parsing response:", hexString);

	if (hexString === "NO DATA" || hexString === "OK" || hexString === "?" || hexString === "UNABLE TO CONNECT" || hexString === "SEARCHING...") {
		//No data or OK is the response, return directly.
		return {};
	}

	hexString = hexString.replace(/ /g, ''); //Whitespace trimming //Probably not needed anymore?
	var valueArray = [];

	for (var byteNumber = 0; byteNumber < hexString.length; byteNumber += 2) {
		valueArray.push(hexString.substr(byteNumber, 2));
	}

	var reply = {};
	if (valueArray[0] === "41") {
		reply.mode = "01"; //valueArray[0];
		reply.pid = valueArray[1];
		for (var i = 0; i < PIDS.length; i++) {

			if (PIDS[i].pid == reply.pid) {
				var numberOfBytes = PIDS[i].bytes;
				reply.name = PIDS[i].name;
				switch (numberOfBytes) {
					case 1:
						reply.value = PIDS[i].convertToUseful(valueArray[2]);
						break;
					case 2:
						reply.value = PIDS[i].convertToUseful(valueArray[2], valueArray[3]);
						break;
					case 4:
						reply.value = PIDS[i].convertToUseful(valueArray[2], valueArray[3], valueArray[4], valueArray[5]);
						break;
					case 8:
						reply.value = PIDS[i].convertToUseful(valueArray[2], valueArray[3], valueArray[4], valueArray[5], valueArray[6], valueArray[7], valueArray[8], valueArray[9]);
						break;
				}
				break; //Value is converted, break out the for loop.
			}
		}
	} 
	else if (valueArray[0] === "43") {
		reply.mode = valueArray[0];
		for (var i = 0; i < PIDS.length; i++) {
			if (PIDS[i].mode == "03") {
				reply.name = PIDS[i].name;
				reply.value = PIDS[i].convertToUseful(valueArray[1], valueArray[2], valueArray[3], valueArray[4], valueArray[5], valueArray[6]);
			}
		}
	}
	return reply;
}

OBD.prototype.initialize = function() {

	this.write("ATZ");		// Reset
	this.write("ATL0");		// Linefeed off
	this.write("ATS0");		// Spaces off
	this.write("ATH0");		// Headers off
	this.write("ATE0");		// Echo off
	this.write("ATSP3");	// Select ISO 9142-2 protocol

	this.write("0100"); 	// get supported pids 00-20
	//this.write("0120"); 	// get supported pids 21-40
	//this.write("0140"); 	// get supported pids 41-60

	for (var i = 0; i < this.poll.length; i++) {
		var pid = this.poll[i];
		this.write(pid, true);
	}
}


OBD.prototype.isPIDSupported = function(pid) {

	if(pid == "0100" || pid == "0120" || pid == "0140" || pid == "0160") {
		// these are the commands to get the supported pids, so yes... let's accept it.
		return true;
	}

	for (var i = 0; i < this.supportedPIDs.length; i++) {
		var supportedPID = this.supportedPIDs[i];

		if(supportedPID == pid) {
			return true;
		}	
	}

	return false;
}

// Export the class as singleton
module.exports = exports = new OBD();
