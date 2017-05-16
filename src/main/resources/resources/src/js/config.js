var BASE_URL = '';
var app = angular.module('starterApp', ['ngMessages', 'ngFileUpload', 'ngRoute', 'ngAnimate', 'ui.bootstrap']);

// Use x-www-form-urlencoded Content-Type instead of application/json
// referenced from:
// http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;

    $httpProvider.defaults.headers.post['Content-Type'] =
        'application/x-www-form-urlencoded;charset=utf-8';
    var param = function(obj) {
        var query = '',
            name, value,
            fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            if (obj.hasOwnProperty(name)) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        if (value.hasOwnProperty(subName)) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    }
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];

}]);
