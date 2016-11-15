angular.module('ava.services')
	.factory('music', function ($q, $rootScope, socket) {

		this.getPlaylist = function() {
			var deferred = $q.defer();
			socket.emit("mpd get playlist", function(err, playlist) {
				console.log("MusicService: get playlist:", err, playlist);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(playlist); }
			});
			return deferred.promise;
		},

		this.getPlaylists = function() {
			var deferred = $q.defer();
			socket.emit("mpd get playlists", function(err, playlists) {
				console.log("MusicService: get playlists:", err, playlists);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(playlists); }
			});
			return deferred.promise;
		},

		this.loadPlaylist = function(playlist) {
			var deferred = $q.defer();
			socket.emit("mpd load playlist", playlist, function(err, msg) {
				console.log("MusicService: load playlist:", err, msg);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(msg); }
			});
			return deferred.promise;
		},

		this.getStatus = function() {
			var deferred = $q.defer();
			socket.emit("mpd get status", function(err, status) {
				console.log("MusicService: get status:", err, status);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(status); }
			});
			return deferred.promise;
		},

		this.getCurrentSong = function() {
			var deferred = $q.defer();
			socket.emit("mpd get current song", function(err, song) {
				console.log("MusicService: get current song:", err, song);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(song); }
			});
			return deferred.promise;
		},

		this.play = function() {
			var deferred = $q.defer();
			socket.emit("mpd play", function(err, msg) {
				console.log("MusicService: play", err, msg);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(msg); }
			});
			return deferred.promise;
		},

		this.pause = function() {
			var deferred = $q.defer();
			socket.emit("mpd pause", function(err, msg) {
				console.log("MusicService: pause", err, msg);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(msg); }
			});
			return deferred.promise;
		},
		
		this.previous = function() {
			var deferred = $q.defer();
			socket.emit("mpd previous", function(err, msg) {
				console.log("MusicService: previous", err, msg);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(msg); }
			});
			return deferred.promise;
		},
		
		this.next = function() {
			var deferred = $q.defer();
			socket.emit("mpd next", function(err, msg) {
				console.log("MusicService: next", err, msg);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(msg); }
			});
			return deferred.promise;
		},
		
		this.seek = function(time) {
			var deferred = $q.defer();
			socket.emit("mpd seek", time, function(err, msg) {
				console.log("MusicService: seeking to", time, err, msg);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(msg); }
			});
			return deferred.promise;
		},

		this.playSong = function(song) {
			var deferred = $q.defer();
			socket.emit("mpd play song", song.id, function(err, msg) {
				console.log("MusicService: playing song", song, err, msg);
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(msg); }
			});
			return deferred.promise;
		},

		this.getBackground = function() {
			var deferred = $q.defer();
			socket.emit('mpd get background', function(path) {
				//$('.background').css('background-image', 'url("' + path + '")');
				console.log("MusicService: get background", path);
				deferred.resolve(path);
			});
			return deferred.promise;
		},

		this.setVolume = function(volume) {
			console.log("MusicService: setting volume to", volume);
			var deferred = $q.defer();
			socket.emit('mpd set volume', volume, function() {
				console.log("MusicService: set volume to", volume);
				deferred.resolve(volume);
			});
			return deferred.promise;
		},

		this.getLyrics = function() {
			var deferred = $q.defer();
			socket.emit('mpd get lyrics', function(lyrics) {
				console.log("MusicService: get lyrics", lyrics);
				deferred.resolve(lyrics);
			});
			return deferred.promise;
		},


		socket.on('mpd song changed', function(song) {
			$rootScope.$emit("music song changed", song);
		});
		
		socket.on('mpd status', function(status) {
			$rootScope.$emit("music status updated", status);
		});

		socket.on('mpd system updated', function(system) {
			$rootScope.$emit("music system updated", system);
		});

		return {
			getPlaylist: this.getPlaylist,
			getPlaylists: this.getPlaylists,
			loadPlaylist: this.loadPlaylist,
			getStatus: this.getStatus,
			getCurrentSong: this.getCurrentSong,
			play: this.play,
			pause: this.pause,
			previous: this.previous,
			next: this.next,
			seek: this.seek,
			playSong: this.playSong,
			getBackground: this.getBackground,
			getLyrics: this.getLyrics,
			setVolume: this.setVolume,
		}

	});