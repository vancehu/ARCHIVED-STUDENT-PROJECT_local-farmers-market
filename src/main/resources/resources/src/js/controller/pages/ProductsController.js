//control product list page
var ProductsController = ['$scope', '$http', '$rootScope', '$routeParams', '$location', function ($scope, $http, $rootScope, $routeParams, $location) {
    $rootScope.top();
    $rootScope.getStatus();

    $scope.tagsArr = $routeParams.tags ? $routeParams.tags.split(',').map(function (v) {
        return parseInt(v);
    }) : [];
    $scope.tagLoaded = true;
    $scope.currPage = $routeParams.page || 1;
    $scope.keyword = decodeURIComponent($routeParams.keyword || "") ;
    $scope.sort = $routeParams.sort || '0';
    $scope.products = [];
    $scope.productsCount = 0;

    $scope.countProducts = function () {
        var query = {
            tags: $scope.tagsArr.length > 0 ? $scope.tagsArr.join(",") : null,
            keyword: $routeParams.keyword
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'countProducts', query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.productsCount = resp.data.payload;
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
    $scope.countProducts();

    $scope.getProducts = function () {
        var query = {
            tags: $scope.tagsArr.length > 0 ? $scope.tagsArr.join(",") : null,
            keyword: $routeParams.keyword,
            sort: $routeParams.sort,
            page: $scope.currPage
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'getProducts', query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.products = resp.data.payload;
            } else {
                $rootScope.addErrorAlert();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };
    $scope.getProducts();


    $scope.loadPage = function() {
        if ($scope.page !== $scope.currPage) {
            $location.path("products/tags/" + ($routeParams.tags||"") + "/keyword/" + ($routeParams.keyword||"") + "/sort/" + ($routeParams.sort||"") + "/page/" + $scope.page);

        }
    };

    $scope.applySearch = function () {
        if ($scope.keyword === "") {
            $scope.keyword = null;
        }
        $location.path("products/tags/" + $scope.tagsArr.join(",") + ($scope.tagsArr.length > 0 ? "/" : "") + "keyword/" + ($scope.keyword ? encodeURIComponent($scope.keyword) + "/" : "") + "sort" + ($scope.sort ? "/" + $scope.sort + "/" : "") + "page/1");
    };


}];
