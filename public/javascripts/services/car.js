angular.module('ava.services')
	.service('car', function ($q, $rootScope, socket) {

		socket.on('car', function(data) {
			$rootScope.$broadcast('car', data);
		});

	});