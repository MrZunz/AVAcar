var mpd = require('mpd');
var cmd = mpd.cmd;
var sockets = require("./sockets");
var fs = require('fs');
var request = require('request');
var spotifyWebApi  = require('spotify-web-api-node');
var spotifyApi = new spotifyWebApi({});

function MPD() {
	console.log("MPD:", "Initializing...");

	//this.connect();
	// var me = this;
	// setTimeout(function() {
	// 	me.connect();
	// }, 5000);

	this.ready = false;
	this.song = {};
	sockets.on('connection', this.onSocketConnection.bind(this));
}

MPD.prototype.onSocketConnection = function(socket) {
	//console.log("MPD:", "Noticed socket connection event!");
	//socket.on('mpd execute command', this.executeCommand.bind(this));
	socket.on('mpd get playlist', this.getPlaylist.bind(this));
	socket.on('mpd get playlists', this.getPlaylists.bind(this));
	socket.on('mpd load playlist', this.loadPlaylist.bind(this));
	socket.on('mpd play song', this.playSongById.bind(this));
	socket.on('mpd play', this.play.bind(this));
	socket.on('mpd pause', this.pause.bind(this));
	socket.on('mpd previous', this.previous.bind(this));
	socket.on('mpd next', this.next.bind(this));
	socket.on('mpd seek', this.seek.bind(this));
	socket.on('mpd get current song', this.getCurrentSong.bind(this));
	socket.on('mpd set volume', this.setVolume.bind(this));
	socket.on('mpd get background', this.getBackground.bind(this));
	socket.on('mpd get status', this.getStatus.bind(this));
	//socket.on('mpd get lyrics', this.getLyrics.bind(this));
}

MPD.prototype.connect = function() {
	console.log('MPD: Connecting to MPD');
	this.client = mpd.connect({	port: 6600,	host: '127.0.0.1' }); //62.195.44.135
	
	this.client.on('connect', this.onConnect.bind(this));
	this.client.on('error', this.onError.bind(this));
	this.client.on('ready', this.onReady.bind(this));
	this.client.on('system', this.onSystem.bind(this));
}

MPD.prototype.onConnect = function() {
	console.log("MPD:", "Connected!");

}

MPD.prototype.onError = function(e) {
	console.log("MPD:", "Error:", e);
	var me = this;

	if(e.code == 'ECONNREFUSED') {
		setTimeout(me.connect.bind(me), 10000);
	}
}

MPD.prototype.onReady = function() {
	var self = this;
	console.log("MPD:", "Ready!");
	this.ready = true;
	this.sendStatus();
	this.getCurrentSong(function(song) { /* Do nothing with the result here */ });
}

MPD.prototype.onSystem = function(system) {
	console.log("MPD:", system, "updated.");
	sockets.io.emit("mpd system updated", system);

	if(system == "player") {
		this.sendStatus();
		this.getCurrentSong(function(song) { /* Do nothing with the result here */ });
	}
}

MPD.prototype.getPlaylist = function(callback) {
	console.log("MPD:", "Getting (current) playlist")
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }
	

	this.client.sendCommand(cmd('playlistinfo', []), function(err, msg) {
		var playlist = parsePlaylistInfoResults(msg);

		callback(err, playlist);
	});
}

MPD.prototype.getPlaylists = function(callback) {
	var self = this;
	console.log("MPD:", "Getting (all) playlists")
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	this.client.sendCommand(cmd('listplaylists', []), function(err, msg) {
		var playlists = new Array();

		if(msg) {
			var msgsplit = msg.split('\n');

			for (var i = 0; i < msgsplit.length; i++) {
				var line = msgsplit[i];
				if(line.indexOf("playlist: ") > -1 ) {
					line = line.replace('playlist: ', '');
					playlists.push(line);
				}
			};
		}

		callback(err, playlists);
	});
}

MPD.prototype.getSongsByPlaylist = function(playlist, callback) {
	var self = this;
    console.log("MPD:", "Getting songs for playlist:", playlist);
    if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

    self.client.sendCommand(cmd('listplaylistinfo', [playlist]), function(err, msg) {
        //console.log("listplaylistinfo command result:", msg);
        var songs = parsePlaylistInfoResults(msg);
        //self.playlists[playlist] = songs;
        callback(songs);
    });
}

MPD.prototype.loadPlaylist = function(playlist, callback) {
	var self = this;
	console.log("MPD:", "Wanting to load playlist:", playlist);
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.executeCommand('clear', function(err, msg) {
		console.log("MPD:", "Cleared playlist");

		self.client.sendCommand(cmd('load', [playlist]), function(err, msg) {
			if(err) { console.log("MPD:", "Command", command, "failed:", err); }
			if(msg) { console.log("MPD:", msg); }
			
			callback(err, msg);
		});
	});
}

MPD.prototype.playSongById = function(songid, callback) {
	var self = this;
	console.log("MPD:", "Wanting to play song with id:", songid);
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.client.sendCommand(cmd('playid', [songid]), function(err, msg) {
		if(err) { console.log("MPD:", "playSongById failed:", err); }
		if(msg) { console.log("MPD:", msg); }
		
		callback(err, msg);
	});
}

MPD.prototype.play = function(callback) {
	var self = this;
	console.log("MPD:", "Starting playing");
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.client.sendCommand(cmd('pause', [0]), function(err, msg) {
		if(err) { console.log("MPD:", "Command", command, "failed:", err); }
		if(msg) { console.log("MPD:", msg); }
		
		callback(err, msg);
	});
}

MPD.prototype.pause = function(callback) {
	var self = this;
	console.log("MPD:", "Paused playing");
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.client.sendCommand(cmd('pause', [1]), function(err, msg) {
		if(err) { console.log("MPD:", "Command", command, "failed:", err); }
		if(msg) { console.log("MPD:", msg); }
		
		callback(err, msg);
	});
}

MPD.prototype.previous = function(callback) {
	var self = this;
	console.log("MPD:", "Playing previous song");
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.client.sendCommand(cmd('previous', []), function(err, msg) {
		if(err) { console.log("MPD:", "Command", command, "failed:", err); }
		if(msg) { console.log("MPD:", msg); }
		
		callback(err, msg);
	});
}

MPD.prototype.next = function(callback) {
	var self = this;
	console.log("MPD:", "Playing next song");
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.client.sendCommand(cmd('next', []), function(err, msg) {
		if(err) { console.log("MPD:", "Command", command, "failed:", err); }
		if(msg) { console.log("MPD:", msg); }
		
		callback(err, msg);
	});
}

MPD.prototype.seek = function(time, callback) {
	var self = this;
	console.log("MPD:", "Seeking");
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.client.sendCommand(cmd('seekcur', [time]), function(err, msg) {
		if(err) { console.log("MPD:", "Command", command, "failed:", err); }
		if(msg) { console.log("MPD:", msg); }
		
		callback(err, msg);
	});
}

MPD.prototype.getCurrentSong = function(callback) {
	var self = this;
	console.log("MPD:", "Getting (current playing) song")
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	this.client.sendCommand(cmd('currentsong', []), function(err, msg) {
		var song = {};
		var lines = msg.split('\n');

		for(var i = 0; i < lines.length; i++) {
			var line = lines[i].toString().split(": ");
			song[line[0].toLowerCase()] = line[1]; 
		}

		if(song.artist) { 
			song.artist = song.artist.replace(';', ', ');
		}

		// Check for changes
		if(self.song.file != song.file) {
			self.onSongChanged(song);

			// self.getLyrics(function(lyrics) {

			// });
		}

		self.song = song;

		callback(err, song);
	});
}

MPD.prototype.onSongChanged = function(song) {
	console.log("MPD:", "Song changed!");
	sockets.io.emit("mpd song changed", song);
}

MPD.prototype.getStatus = function(callback) {
	var self = this;
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.client.sendCommand(cmd('status', []), function(err, msg) {
		//if(err) { console.log("MPD:", "Command", command, "failed:", err); }
		//if(msg) { console.log("MPD:", msg); }

		var status = {};
		var lines = msg.split('\n');

		for(var i = 0; i < lines.length; i++)
		{
			var line = lines[i].toString().split(": ");
			if(line[0] != "") {
				status[line[0].toLowerCase()] = line[1];	
			}
		}

		//console.log(status);

		callback(err, status);
	});
}

MPD.prototype.search = function(type, query, callback) {
	var self = this;
	console.log("MPD:", "Searching for", type, query);
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.client.sendCommand(cmd('search ', [type, query]), function(err, msg) {
		var result = parseSearchResult(msg);
		callback(result);
	});
}

MPD.prototype.findSongsByArtist = function (artist, callback) {
	var self = this;
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }
	self.search("artist", artist, function(result) {

		var songs = new Array();

		for (var i = 0; i < result.songs.length; i++) {
			var song = result.songs[i];
			if(song.artist.toLowerCase() == artist.toLowerCase()) {
				songs.push(song);
			}
		};

		console.log("songs by artist", artist);
		console.log(songs);

		callback(songs);
	});
}

MPD.prototype.findSongByArtist = function (song, artist, callback) {
	var self = this;
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }
	self.search("artist", artist, function(result) {
		//console.log("Amount of artists named", artist, " is", result);
		// console.log("Amount of songs by ", artist, " is", result.songs.length);
		var songToReturn = null;
		var lowestDistance = 100;

		if(result.songs) {
			for (var i = 0; i < result.songs.length; i++) {
				var record = result.songs[i];

				var ls = new levenshtein(record.title.toLowerCase(), song.toLowerCase());

				if(ls.distance < lowestDistance && ls.distance <= 10) {
					lowestDistance = ls.distance;
					songToReturn = record;
				}
			};
		}
		
		callback(songToReturn);
	});
}

MPD.prototype.findSongByArtistAndAddToCurrentPlaylist = function (song, artist, callback) {
	var self = this;
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.findSongByArtist(song, artist, function(songToPlay) {
		if(songToPlay) {
			// Check if it is in the current playlist
			self.getPlaylist(function(playlist) {
				// Loop over the songs in the current playlist to find it
				var songid = null;
				for (var i = 0; i < playlist.length; i++) {
					var song = playlist[i];
					if(song.file == songToPlay.file) {
						songid = song.id;
					}
				};

				if(songid) {
					// We have found the song in the current playlist, let's use that id!
					callback(songid);
					return;
				}
				else {
					// It is not in the current playlist, so let's add it.
					self.client.sendCommand(cmd('addid', [songToPlay.file]), function(err, msg) {
						var songid = Number(msg.replace('Id: ', ''))
						console.log("Added the song", songToPlay.title, "to the current playlist with id" + songid);
						callback(songid);
						return;
					});
				}
			});
		}
		else {
			callback(null);
		}
	});
}

MPD.prototype.findSongs = function (title, callback) {
	var self = this;
	self.search("title", title, function(result) {

		var songs = new Array();

		for (var i = 0; i < result.songs.length; i++) {
			var song = result.songs[i];
			songs.push(song);
		};

		console.log("songs", songs);
		console.log(songs);

		callback(songs);
	});
}

MPD.prototype.findSongAndAddToCurrentPlaylist = function (title, callback) {
	var self = this;
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }
	self.findSongs(title, function(songs) {

		var songToPlay = songs[0]; // always pick the first one, I hope that one is the most relavant / popular

		// Check if it is in the current playlist
		self.getPlaylist(function(playlist) {

			// Loop over the songs in the current playlist to find it
			var songid = null;
			for (var i = 0; i < playlist.length; i++) {
				var song = playlist[i];
				if(song.file == songToPlay.file) {
					songid = song.id;
				}
			};

			if(songid) {
				// We have found the song in the current playlist, let's use that id!
				callback(songid);
				return;
			}
			else {
				// It is not in the current playlist, so let's add it.
				self.client.sendCommand(cmd('addid', [songToPlay.file]), function(err, msg) {
					var songid = Number(msg.replace('Id: ', ''))
					console.log("Added the song", songToPlay.title, "to the current playlist with id" + songid);
					callback(songid);
					return;
				});
			}
		});
	
	});
}

MPD.prototype.setVolume = function(volume, callback) {
	var self = this;
	volume = Math.round(Number(volume));
	console.log("MPD:", "Setting volume to", volume);
	if(!this.ready) { console.log('MPD: Not ready to accept commands yet'); return; }

	self.client.sendCommand(cmd('setvol', [volume]), function(err, msg) {
		if(err) { console.log("MPD:", "Command", command, "failed:", err); }
		if(msg) { console.log("MPD:", msg); }
		
		callback(msg);
	});
}

MPD.prototype.getBackground = function(callback) {
	console.log("MPD:", "Getting background");
	this.getCurrentSong(function(err, song) {
		if(song.file == null) { return; }

		var spotifyID = song.file.split(':').slice(-1)[0];
		var publicPath = "/images/songs/" + spotifyID + ".png";
		var filepath = __dirname + "/../public" + publicPath;

		fs.exists(filepath, function(exists) {
			if(!exists) {
				// We have to retrieve the image from the spotify web api
				spotifyApi.getTrack(spotifyID).then(function(data) {
					
					console.log("MPD:", "All possible song backgrounds:");
					for (var i = 0; i < data.body.album.images.length; i++) {
						var image = data.body.album.images[i];
						console.log("MPD:", image);
					};

					console.log("Starting downloading: " + data.body.album.images[0].url.toString());
					request.get(data.body.album.images[0].url.toString())
						.on('error', function(err) {
							console.log(err)
						})
						.pipe(fs.createWriteStream(filepath))
						.on('close', function() {
							callback(publicPath);
						});
				}, function(err) {
                    console.error(err);
                });
			}
			else {
				// We already have got the background saved
				console.log("MPD: We already have the background saved:", publicPath);
				callback(publicPath);
			}
		});
	});
}

MPD.prototype.sendStatus = function() {
	var self = this;

	this.getStatus(function(err, status) {
		sockets.io.emit("mpd status", status);

		if(status.state == "play") {
			clearTimeout(self.sendStatusTimer);
			self.sendStatusTimer = setTimeout(self.sendStatus.bind(self), 500);	
		} 
	});
}

MPD.prototype.executeCommand = function(command, callback) {
	if(this.ready) { 
		this.client.sendCommand(cmd(command, []), function(err, msg) {
			if(err) { console.log("MPD:", "Command", command, "failed:", err); }
			if(msg) { console.log("MPD:", msg); }
			
			callback(err, msg);
		});
	}	
}

/* DIED :( */
MPD.prototype.getLyrics = function(callback) {
    this.getCurrentSong(function(err, song) { 
        if(song.file != null) {

            var apiurl = 'https://apic-spotify.musixmatch.com/ws/1.1/';
            var method = 'macro.subtitles.get?';
            var authorization = 'app_id=spotify-app-v2.0&usertoken=14bddca2a97c5faef5475afa8bbd9dc1f417260538d376f3&';
            var title = 'q_track=' + song.title + '&';
            var artist = 'q_artist=' + song.artist + '&';
            var album = 'q_album=' + song.album +  '&';
            var albumArtist = 'q_album_artist=' + song.albumartist;

            var url = apiurl + method + authorization + title + artist + album + albumArtist;
            console.log('url:', url);

            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);

                    console.log(data);
                    var macrocalls = data.message.body.macro_calls;
                    //console.log(data.message.body.macro_calls);

                    if(macrocalls['track.subtitles.get'] != null) {
                        // Found lyrics, probably...
                        var statuscode = macrocalls['track.subtitles.get'].message.header.status_code;
                        console.log(statuscode);
                        if(statuscode == "200") {
                            // Lyrics are found

                            if(macrocalls['track.subtitles.get'].message.body.subtitle_list != null) {
                            	var rawlyrics = macrocalls['track.subtitles.get'].message.body.subtitle_list[0].subtitle.subtitle_body;
                            	var lyrics = parseLyrics(rawlyrics);
                            	callback(lyrics);
                            }
                            else {
                            	// No lyrics were found? No idea why, but ok. TODO: Find out ;)
                            	callback(null);
                            }   
                        }
                        else {
                            // No lyrics were found
                            callback(null);
                        }           
                    }
                }
                else if(error.code == "ENOTFOUND") {
                    callback(null);
                }
            });
        }
    });
}

function parsePlaylistInfoResults(rawplaylistinfo) {
	var playlistinfo = [];
	var temp = {};

	if(rawplaylistinfo == null || rawplaylistinfo == "") { 
		return playlistinfo; 
	}

	var rawplaylistinfo = rawplaylistinfo.split('\n');

	// 3spooby5me to explain all this
	for(var i = 0; i < rawplaylistinfo.length; i++)
	{
		var line = rawplaylistinfo[i].toString().split(": ");

		if(line[0] == "file")
		{
			if(Object.keys(temp).length > 0)
			{
				playlistinfo.push(JSON.parse(JSON.stringify(temp)));
			}

			temp = {};
			temp.file = line[1];
		}
		else
		{
			temp[line[0].toLowerCase()] = line[1];

			// Make sure the last one gets added too!
			if(rawplaylistinfo.length - 1 == i) 
			{
				playlistinfo.push(JSON.parse(JSON.stringify(temp)));
			}
		}
	}

	return playlistinfo;
}

function parseSearchResult(rawresult) {
	var result = [];
	var temp = {};

	if(rawresult == null || rawresult == "") { 
		return result; 
	}

	var rawresult = rawresult.split('\n');

	// 3spooby5me to explain all this
	for(var i = 0; i < rawresult.length; i++)
	{
		var line = rawresult[i].toString().split(": ");

		if(line[0] == "file")
		{
			if(Object.keys(temp).length > 0)
			{
				result.push(JSON.parse(JSON.stringify(temp)));
			}

			temp = {};
			temp.file = line[1];
		}
		else
		{
			temp[line[0].toLowerCase()] = line[1];

			// Make sure the last one gets added too!
			if(rawresult.length - 1 == i) 
			{
				result.push(JSON.parse(JSON.stringify(temp)));
			}
		}
	}

	var improvedResult = { artists: new Array(), albums: new Array(), songs: new Array() }

	for (var i = 0; i < result.length; i++) {
		var record = result[i];
		if(record.file.indexOf('spotify:artist') > -1) {
			improvedResult.artists.push(record);
		}
		if(record.file.indexOf('spotify:album') > -1) {
			improvedResult.albums.push(record);
		}
		if(record.file.indexOf('spotify:track') > -1) {
			improvedResult.songs.push(record);
		}
	};

	return improvedResult;
}

function parseLyrics(lyrics) {
    
    var rawlyrics = lyrics.split('\n');

    var lyrics = [];

    for(var i = 0; i < rawlyrics.length; i++) {
        var line = rawlyrics[i];

        // \A\[(\d+):(\d+).(\d+)\]
        var lineregex = /\[([^)]+)\]/;
        var time = lineregex.exec(line)[1]; // Example: 02:38.86

        var minutesregex = /[^:]*/
        var minutes = minutesregex.exec(time)[0]; // Example: 02

        var seconds = time.substring(time.lastIndexOf(":") + 1, time.lastIndexOf("."));
        var totalseconds = Number(seconds) + (Number(minutes) * 60);
        
        var text = line.split('] ')[1];

        var line = {};
        line.seconds = totalseconds;
        line.text = text;

        lyrics.push(line);
    }
    console.log('parsed lyrics:', lyrics);

    return lyrics;
}


// Export the class as singleton
module.exports = exports = new MPD();