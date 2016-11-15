angular.module('ava.controllers').controller('footerController', function ($scope, $rootScope, $location, music) {

	$scope.init = function() {
		
		$("#footer #elapsed .progressbar").slider( { min: 0, max: 100, value: 0, range: "min", step: 0.001, stop: function(e, obj) {
			var percentage = obj.value;
			var total = Number($rootScope.musicStatus.time.split(":")[1]);
			var secondsFromPercentage = Math.floor((percentage / 100) * total);
			$scope.seek(secondsFromPercentage);
		} } );

		$scope.update();
	}

	$scope.initVolume = function() {
		$("#footer #volume .progressbar").slider( { min: 0, max: 100, value: 0, range: "min", step: 10, stop: function(e, obj) {
			var volume = obj.value;
			$("#footer #volume .amount").text(volume);
			$scope.setVolume(volume);		
		} } );
	}

	$scope.play = function() {
		music.play();
	}

	$scope.pause = function() {
		music.pause();
	}

	$scope.previous = function() {
		music.previous();
	}

	$scope.next = function() {
		music.next();
	}

	$scope.seek = function(time) {
		music.seek(time);
	};

	$scope.setVolume = function(volume) {
		music.setVolume(volume);
	};

	$scope.toggleShowVolumeControl = function() {
		$scope.showVolumeControl = !$scope.showVolumeControl;
	}

	$scope.update = function() {
		music.getStatus().then(function(status) {
			$rootScope.musicStatus = status;
		});

		music.getBackground().then(function(background) {
			$('.background').css('background-image', 'url("' + background + '")');
		});

		music.getCurrentSong().then(function(song) {
			$rootScope.currentSong = song;
		});
	}

	$rootScope.$on('music status updated', function(event, status) {

		$rootScope.musicStatus = status;

		// Update the progress/elapsed bar
		if(status.time) {
			var elapsed = Number(status.time.split(":")[0]);
			var total = Number(status.time.split(":")[1]);
			var percentage = (elapsed / total * 100);

			if(!$("#footer #elapsed .progressbar .ui-slider-handle").hasClass("ui-state-active")) {
				$("#footer #elapsed .progressbar").slider('value', percentage);
			}
		};

		if(status.volume) {

			if(!$("#footer #volume .progressbar .ui-slider-handle").hasClass("ui-state-active")) {
				$("#footer #volume .progressbar").slider('value', Number(status.volume));
				$("#footer #volume .amount").text(status.volume);
			}
		};
	});

	$rootScope.$on('music song changed', function(song) {
		$rootScope.currentSong = song;

		$scope.update();
	});
});