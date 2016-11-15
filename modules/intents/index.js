var sockets = require("../sockets");
var tts = require("../tts");
var apiai = require('apiai')('71f37f5346c24d11905fa58e18fe3c5f', '92f523d0-6faa-4aef-afbc-f8459fc31be1');

function Intents() {
	console.log("Intents: Initializing");
	sockets.on('connection', this.onSocketConnection.bind(this));

	this.actions = new Array();
	this.actions['weather'] = require('./actions/weather');
}

Intents.prototype.onSocketConnection = function(socket) {
	socket.on('think', this.think.bind(this));
}

Intents.prototype.think = function(text, callback) {
	var me = this;
	console.log("Intents: Have to think about:", text);
    
    var params = { };
    var request = apiai.textRequest(text, params);

	request.on('response', function(intent) {
		console.log("Intents: Response:", intent);

		// Executes the function/method if it is found on the action, i.e. of "weather.search" weather is the action and search is the method

		if(intent.result.action) {
			var action = intent.result.action.split('.')[0];
			var method = intent.result.action.split('.')[1];
			var parameters = intent.result.parameters;

			console.log('Intents:', 'Got to do action', action, 'and method', method);
			if(me.actions[action]) {
				console.log('We do have a', action, 'action! Lets try and call the method', method);
				if(me.actions[action][method]) {
					me.actions[action][method](parameters);
				}
				else {
					console.log("Intents:", 'No method', method, 'found on action', action);
				}
			}
			else {
				console.log("Intents:", 'No', action, 'action exists.');
			}
		}
		// Only say things when we have to. if not, the action might decide to talk back to the user
		tts.say(intent.result.fulfillment.speech, function(text, filename) {
			var response = { text: intent.result.fulfillment.speech, filename: filename, intent: intent, action: action, method: method, parameters: parameters};
			callback(response);
		});
		
	});

	request.on('error', function(error) {
		console.log("Intents: Error:", error);
		callback();
	});

	request.end();
}

module.exports = exports = new Intents();