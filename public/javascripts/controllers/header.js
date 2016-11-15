angular.module('ava.controllers').controller('headerController', function ($scope, $interval, $rootScope, $location) {
	$scope.isActive = function (viewLocation) { 
		console.log('isActive:', viewLocation);
		return viewLocation === $location.path();
	};

	$scope.navigate = function(page) {
		$rootScope.page = page;
		$location.path(page);
		console.log('navigate:', page);
	};

	$scope.time = new Date();
	$interval(function() {
		$scope.time = new Date();
	}, 1000);

	$scope.getClass = function (path) {
		return ($location.path().substr(0, path.length) === path) ? 'active' : '';
	}
});