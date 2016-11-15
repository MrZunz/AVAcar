angular.module('ava.services')
	.factory('intents', function ($q, socket) {

		this.think = function(text) {
			var deferred = $q.defer();
			socket.emit("think", text, function(data) {
				console.log('Intents: Response:', data);
				deferred.resolve(data);
			});
			return deferred.promise;
		}

		return {
			think: this.think
		}

	});