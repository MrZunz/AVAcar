angular.module('ava.controllers').controller('mainController', function ($scope, socket, intents) {

	$scope.think = function(text) {	
		if(!text) { text = $scope.about; }

        if(text.toLowerCase() == "stop") {
            $('audio#tts').trigger('stop');
        }
        
        intents.think(text).then(function(res) {

            $('#speech-output').text(res.text);
            if(res.filename) {
               $('audio#tts').attr('src', '/speech/' + res.filename).trigger('play'); 
            }
            
            $scope.doAction(res.action, res.method);
        });
        		
	},

    $scope.doAction = function(action, method) {
        $scope.type1 = action;
    },

    socket.on('say', function(data) {
        $('audio#tts').attr('src', '/speech/' + data.filename).trigger('play');
        $('#speech-output').text(data.text);
    });


});