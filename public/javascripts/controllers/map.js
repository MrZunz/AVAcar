angular.module('ava.controllers').controller('mapController', function ($scope, socket) {

	$scope.init = function(page) {	
		L.mapbox.accessToken = 'pk.eyJ1IjoibXJ6dW56IiwiYSI6ImZGWXBkX2cifQ.zqlOSzYS_bw8knT625WK1w';
		var map = L.mapbox.map('map', 'mapbox.streets').setView([52.191980, 6.017725], 20);
	}
});