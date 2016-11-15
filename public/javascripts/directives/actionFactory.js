// ALL CREDITS GO TO EDO LIMBURG

angular.module('ava.directives', []).directive('uiBar',
  function($compile, $parse) {
    return {
      restrict: 'EAC',
      require: '?ngModel',
      scope: {
        type: '='
      },
      compile: function(el, attr) {
        //el.removeAttr('ui-bar'); // necessary to avoid infinite compile loop
        var fn = function(scope, directiveName) {
          var element = el[0];
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          var newEl = document.createElement(directiveName);
          $compile(newEl)(scope);
          el.append(newEl);
        }
        return function($scope, element, attrs, controller) {
          $scope.$watch("type",
            function(newValue) {
              fn($scope, newValue)
            });
        };
      }
    };
  }
)