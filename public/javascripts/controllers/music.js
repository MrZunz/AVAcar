angular.module('ava.controllers').controller('musicController', function ($rootScope, $scope, $location, socket, music, cfpLoadingBar) {

	console.log("musicController created");

	socket.on('connect', function() {
		$scope.init();
	});
	
	$scope.init = function(page) {	

		setTimeout(function() {
			$scope.scrollbar = new IScroll('.page', { click: true, scrollbars: true, resizeScrollbars: true, fadeScrollbars: true});
		}, 250);

		// $scope.getStatus();
		// $scope.getCurrentSong();
		// $scope.getBackground();
		
		switch(page) {
			case 'playlist':
				$scope.getPlaylist();
				break;
			case 'playlists':
				$scope.getPlaylists();
				break;
			case 'lyrics':
				$scope.getLyrics();
				break;
		}
	}

	$scope.getPlaylist = function() {
		cfpLoadingBar.start();

		music.getPlaylist().then(function(playlist) {
			$scope.playlist = playlist;

			setTimeout(function() {
				$scope.scrollbar.refresh();
				cfpLoadingBar.complete();
			}, 250);
		});
	}

	$scope.getPlaylists = function() {
		cfpLoadingBar.start();

		music.getPlaylists().then(function(playlists) {
			$scope.playlists = playlists;
			setTimeout(function() {
				$scope.scrollbar.refresh();
				cfpLoadingBar.complete();
			}, 250);
		});
	}

	$scope.loadPlaylist = function(playlist) {
		console.log("MusicController: loading playlist:", playlist);
		cfpLoadingBar.start();

		music.loadPlaylist(playlist).then(function() {
			cfpLoadingBar.complete();
			$rootScope.currentPlaylist = playlist;
			$location.path("/music");
		});
	}

	// Already done by the footer
	// $scope.getStatus = function() {
	// 	console.log("MusicController: calling get status");
	// 	music.getStatus().then(function(status) {
	// 		//console.log("MusicController: status:", status);
	// 		$rootScope.musicStatus = status;
	// 	});
	// }

	// Already done by the footer
	// $scope.getBackground = function() {
	// 	music.getBackground().then(function(background) {
	// 		$('.background').css('background-image', 'url("' + background + '")');
	// 	});
	// };

	// Already done by the footer
	// $scope.getCurrentSong = function() {
	// 	console.log("MusicController: get current song");

	// 	music.getCurrentSong().then(function(song) {
	// 		$rootScope.currentSong = song;
	// 	});
	// };

	$scope.playSong = function(song) {
		music.playSong(song);
	};

	$scope.getLyrics = function() {
		console.log("MusicController: get current song lyrics");

		music.getLyrics().then(function(lyrics) {
			$scope.lyrics = lyrics;
			$scope.scrollbar.refresh();
		});
	};

	/// 
	/// Server events
	/// 
	$rootScope.$on('music song changed', function(event, song) {
		console.log("song changed:", song);

		// it might be that we are on the lyrics page so we should get a new one
		$scope.getLyrics();
	});

	$rootScope.$on('music system updated', function(event, system) {
		console.log("System updated:", system);
	});

	$rootScope.$on('music status updated', function(event, status) {
		console.log("status updated:", status);

	
		// Update lyrics
		var elapsedSeconds = Number(status.time.split(":")[0]);

		if(!$scope.lyrics) { return; }

		for (var i = 0; i < $scope.lyrics.length; i++) {
			var line = $scope.lyrics[i];
			line.active = false;

			if(line.seconds && elapsedSeconds >= line.seconds && $scope.lyrics[i + 1] && $scope.lyrics[i + 1].seconds > elapsedSeconds) { //  
				line.active = true;
				//console.log("Current line being sung:", line);

				if($('#lyrics .'+ i)[0]) {
					$scope.scrollbar.refresh();
					$scope.scrollbar.scrollToElement($('#lyrics .'+ i)[0], 2000, null, true, null);
				}
				
			}
		}
		
		


	});
});