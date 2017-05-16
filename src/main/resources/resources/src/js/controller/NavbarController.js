//automatically dock the navigation bar when scrolling down
app.controller('NavbarController', ['$window', '$scope', '$location',function ($window, $scope, $location) {
    $scope.dockMode = false;
    angular.element($window).on('scroll', function () {
        $scope.$apply(function () {
            $scope.dockMode = $window.scrollY > 100;
        });
    });
    $scope.openProductsPage = function(keyword){
        $location.path("products/tags/keyword/"+ encodeURIComponent(keyword) +"/sort/page");
        $scope.search = "";
    };
}]);
