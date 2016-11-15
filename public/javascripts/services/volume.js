angular.module('ava.services')
	.factory('volume', function ($q) {

		this.increase = function() {
			var deferred = $q.defer();
			socket.emit("increase volume", function(err, msg) {
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(msg); }
			});
			return deferred.promise;
		},

		this.decrease = function() {
			var deferred = $q.defer();
			socket.emit("decrease volume", function(err, msg) {
				if(err) { deferred.reject(err); }
				if(!err) { deferred.resolve(msg); }
			});
			return deferred.promise;
		}

		return {
			increase: this.increase,
			decrease: this.decrease
		}

	});