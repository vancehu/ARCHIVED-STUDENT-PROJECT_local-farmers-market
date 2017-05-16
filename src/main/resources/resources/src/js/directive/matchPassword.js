//password matching validator for register/password updating
app.directive('matchPassword', function() {
    'use strict';
    return {
        require: 'ngModel',
        scope: {
            otherModelValue: '=matchPassword'
        },
        link: function(scope, element, attrs, model) {
            model.$validators.matchPassword = function(modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch('otherModelValue', function() {
                model.$validate();
            });
        }
    };
});
