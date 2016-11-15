angular.module('ava.controllers').controller('carController', function ($rootScope, $scope, $location, socket, car, cfpLoadingBar) {

	console.log("carController created");

	socket.on('connect', function() {
		$scope.init();
	});
	
	$scope.init = function() {	
		console.log("carController: init();");

		$scope.vss = 0;
		$scope.rpm = 0;
		$scope.throttlepos = 0;

	}

	$scope.$on('car', function(event, data) {
		$scope[data.name] = data.value;
	});

});