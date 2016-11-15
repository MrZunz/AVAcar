var can = require('socketcan');
var sockets = require("../sockets");
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;


function CAN() {
	sockets.on('connection', this.onSocketConnection.bind(this));

	// Create canbus networks
	// sudo /sbin/ip link set can0 up type can bitrate 100000

	//sudo modprobe vcan
	//sudo ip link add dev vcan0 type vcan
	//sudo ip link set up vcan0

	// Attach to canbus networks
	this.channel = can.createRawChannel("can0", true);
	this.channel.addListener("onMessage", this.onCAN0Message.bind(this));
	this.channel.start();

	this.virtualChannel = can.createRawChannel("vcan0", true);
	this.virtualChannel.addListener("onMessage", this.onVCAN0Message.bind(this));
	this.virtualChannel.start();

	this.signals = {};

	var me = this;
	fs.readdirSync(__dirname + '/signals').forEach(function (file) {
		var module = require(path.join(__dirname + '/signals', file));
		me.signals[module.id] = module;
		console.log(module.name, 'signal added');

		module.on('signal', function(signal) {
			console.log('can signal', signal);
			sockets.io.emit("can signal", signal);
		});
	});
}

CAN.prototype.onSocketConnection = function(socket) {
	socket.on('can send', this.send.bind(this));
	socket.on('canbus get signals', this.getSignals.bind(this));
	socket.on('canbus start logging', this.startLogging.bind(this));
	socket.on('canbus stop logging', this.stopLogging.bind(this));
}

CAN.prototype.onCAN0Message = function(msg) {
	//console.log("can msg", "can0", msg);
	//sockets.io.emit("can msg", "can0", msg);

	var id = msg.id.toString(16).toUpperCase();

	// Handling the signals on the raspberry pi itself
	if(this.signals[id]) {
		this.signals[id].parse(msg.data);
	}

}

CAN.prototype.onVCAN0Message = function(msg) {

	var id = msg.id.toString(16).toUpperCase();

	// Handling the signals on the raspberry pi itself
	if(this.signals[id]) {
		this.signals[id].parse(msg.data);
	}

	// Send all the data over the socket to just because
	var data = {
		id: id,
		data: new Buffer(msg.data).toString('base64')
	};

	sockets.io.emit("can data", "vcan0", data);
}


CAN.prototype.getSignals = function (callback) {
	callback(this.signals);
}

CAN.prototype.startLogging = function(callback) {
	var date = Date.now();

	this.loggingProcess = exec('candump -L vcan0 > ' + date + '.log', function(err, stdout, stderr) {
		// if (err) throw err;
		console.log('Started logging canbus data to', date + '.log');
		callback(err);
	});
}

CAN.prototype.stopLogging = function(callback) {
	this.loggingProcess.kill();
	console.log('Stopped logging canbus data');
	callback();
}

CAN.prototype.send = function(msg) {
	console.log("CAN: Sending", msg);
	this.channel.send(msg);
}

module.exports = exports = new CAN();