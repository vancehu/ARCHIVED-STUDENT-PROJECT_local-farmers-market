//control my products page
var MyProductsController= ['$rootScope', '$scope', '$routeParams', '$http','$location', function($rootScope, $scope, $routeParams, $http,$location){
    $rootScope.top();
    $rootScope.getStatus(function () {
        $rootScope.checkIsLogged();
        $rootScope.checkIsSupplier();
        $scope.countMyProducts();
        $scope.getMyProducts();
    });

    $scope.tagsArr = [];
    $scope.tagsArrIncludeParent = true;
    $scope.currPage = $routeParams.page;
    $scope.myProducts = [];
    $scope.myProductsCount = 0;
    
    $scope.tracking = [];

    $scope.loadPage = function () {
        if ($scope.page !== $scope.currPage) {
            $location.path("myProducts/" + $scope.page);
        }
    };

    $scope.countMyProducts = function () {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ( 'supplier/countMyProducts'), null).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.myProductsCount = resp.data.payload;
                $scope.page = $scope.currPage;
            } else {
                $rootScope.addErrorAlert();
                $rootScope.home();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $rootScope.home();
        });
    };

    $scope.getMyProducts = function () {

        var query = {
            page: $scope.currPage
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'supplier/getMyProducts', query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.myProducts = resp.data.payload;
            } else {
                $rootScope.addErrorAlert();
                $rootScope.home();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $rootScope.home();
        });
    };

}];