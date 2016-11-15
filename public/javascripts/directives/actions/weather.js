angular.module('ava.directives').directive('weather', function() {
    return {
      restrict: 'EAC',
      require: '?ngModel',
      // link: function($scope, element, attrs, controller) {
      //   var controllerOptions, options;
      //   element.text('HERE COMES THE WEATHER');
      // },
      templateUrl: '/partials/actions/weather'
    };
  }
)