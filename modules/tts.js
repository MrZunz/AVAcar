var fs = require('fs');
var crypto = require('crypto');
var sockets = require("./sockets");
var Ivona = require('ivona-node');
var q = require('q');

function TTS() {
	console.log("TTS: Initializing");
	sockets.on('connection', this.onSocketConnection.bind(this));

	this.ivona = new Ivona({
        accessKey: 'GDNAJ6IBGYEGN5DRJNOQ',
        secretKey: 'KWO9K9DGzXSxOoAlP+dzjr88uE+NBjBPdVN9FEg1'
    });
}

TTS.prototype.onSocketConnection = function(socket) {
	//socket.on('say', this.say.bind(this));
}

TTS.prototype.say = function(text, callback) {
	var me = this;
	console.log("TTS: Got to say:", text);

	if(text == "") { 
		callback(text, null); 
	}

	var hash = crypto.createHash('md5').update(text.toLowerCase()).digest('hex');
	var filename = hash + '.mp3';
	var filepath = './public/speech/' + filename;

	var body = {
		body: {
			voice: {
				name: 'Salli',
				language: 'en-US',
				gender: 'Female'
			}
		}
	}

	fs.exists(filepath, function(exists) {
		if(!exists) {
			me.ivona.createVoice(text, body).pipe(fs.createWriteStream(filepath).on('finish', function() {
				console.log("TTS:", 'file downloaded to', filepath);

				if(callback) {
					callback(text, filename);
				}

			}));
		}
		else {
			console.log("TTS:", 'file already downloaded to', filepath);

			if(callback) {
				callback(text, filename);
			}
		}
	});

}

// Export the class as singleton
module.exports = exports = new TTS();