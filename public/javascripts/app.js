var app = angular.module('ava', [
    'ava.controllers',
    'ava.services',
    'ava.directives',
	'ngRoute',
    'ngAnimate',

    // 3rd party dependencies
    'btford.socket-io',
    'angular-loading-bar',
]);

// Make sure to create the modules
angular.module('ava.controllers', []);
angular.module('ava.services', []);
angular.module('ava.directives', []);

// Routing
app.config(function($routeProvider, $locationProvider) {

    $routeProvider

    .when('/', {
        templateUrl : 'pages/index.jade',
        controller  : 'mainController',
    })

    .when('/music', {
        templateUrl : 'pages/music/playlist.jade',
        controller  : 'musicController',
    })

    .when('/music/lyrics', {
        templateUrl : 'pages/music/lyrics.jade',
        controller  : 'musicController',
    })

    .when('/music/playlists', {
        templateUrl : 'pages/music/playlists.jade',
        controller  : 'musicController'
    })

    .when('/music/settings', {
        templateUrl : 'pages/music/settings.jade',
        controller  : 'musicController'
    })

    .when('/music/search', {
        templateUrl : 'pages/music/search.jade',
        controller  : 'musicController'
    })

    .when('/car', {
        templateUrl : 'pages/car/dashboard.jade',
        controller  : 'carController'
    })

    .when('/map', {
        templateUrl : 'pages/map/index.jade',
        controller  : 'mapController'
    })


    $locationProvider.html5Mode(true);

})
.run(function() {
    
});


// var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
// var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)

// alert(w + "x" + h);