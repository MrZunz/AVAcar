// Required modules
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;
var gpio = require('onoff').Gpio;
var tts = require("./tts");

var switchOut = new gpio(23, 'in', 'both'); // pin #8 from the right row
var switchIn = new gpio(24, 'out');			// pin #9 from the right row

// Constructor
function Powerswitch() {

	switchIn.writeSync(1);
	
	// switchOut.read(function(err, value) {
	// 	if(err) { throw err } 

	// 	console.log("switchOut (GPIO pin 23):", value);
	// });

	switchOut.watch(function(err, value) {
		if(err) { throw err } 

		console.log("switchOut (GPIO pin 23):", value);

		if(value == 1) {
			console.log("We have to shutdown?");

			// if we read the same value after 2 seconds we know for sure!
			setTimeout(function() {

				switchOut.read(function(err, value) {
					if(err) { throw err } 
					console.log("switchOut (GPIO pin 23):", value);

					if(value == 1) {
						console.log("Yes! We have to shutdown!");

						//switchIn.writeSync(0);

						tts.say('It seems my services are no longer required.', function(text, filename) {
							
						});
	
						// child = exec("sudo shutdown -h now", function (error, stdout, stderr) {
						// 	console.log("Shutting down...");
						// });
					}
					else {
						console.log("No! It was fake!");
					}
				});

			}, 2000);
		}
	});

	
}

// Inherit 'on' and 'emit' functions
util.inherits(Powerswitch, EventEmitter);

// Export the class as singleton
module.exports = exports = new Powerswitch();


// Reference script from mausberry
// #!/bin/bash

// #this is the GPIO pin connected to the lead on switch labeled OUT
// GPIOpin1=23

// #this is the GPIO pin connected to the lead on switch labeled IN
// GPIOpin2=24

// echo "$GPIOpin1" > /sys/class/gpio/export
// echo "in" > /sys/class/gpio/gpio$GPIOpin1/direction
// echo "$GPIOpin2" > /sys/class/gpio/export
// echo "out" > /sys/class/gpio/gpio$GPIOpin2/direction
// echo "1" > /sys/class/gpio/gpio$GPIOpin2/value
// while [ 1 = 1 ]; do
// power=$(cat /sys/class/gpio/gpio$GPIOpin1/value)
// if [ $power = 0 ]; then
// sleep 1
// else
// sudo poweroff
// fi
// done