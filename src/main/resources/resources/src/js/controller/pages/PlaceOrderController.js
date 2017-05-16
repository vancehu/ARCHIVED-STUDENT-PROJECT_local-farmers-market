//control cart page
var PlaceOrderController = ['$scope', '$http', '$location', '$rootScope',function ($scope, $http, $location, $rootScope) {
    $rootScope.top();
    $rootScope.getStatus(function(){
        $rootScope.checkIsCustomer();
        $rootScope.checkIsLogged();
        $scope.getCarts();
    });

    $scope.carts = [];
    $scope.input = {};
    $scope.sameAddress = true;
    $scope.totalPrice = 0;
    $scope.totalShippingPrice = 0;

    $scope.getCarts = function () {
        var query = {
            id: $scope.id
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'customer/getCarts', query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.carts = resp.data.payload;
                for (var i = 0; i < $scope.carts.length; i++) {
                    $scope.totalPrice += parseFloat($scope.carts[i].price)*$scope.carts[i].quantity;
                    $scope.totalShippingPrice += parseFloat($scope.carts[i].shippingPrice)*$scope.carts[i].quantity;
                }
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


    $scope.allowSubmit = function () {
        if (!$rootScope.user || !$scope.carts || $scope.carts.length === 0) return false;
        if (!$scope.sameAddress) {
            return $scope.form.$valid;
        }
        return true;
    };

    $scope.placeOrder = function () {
        if ($scope.sameAddress) {
            $scope.input = {
                fullName: $rootScope.user.fullName,
                orgName: $rootScope.user.orgName,
                phone: $rootScope.user.phone,
                email: $rootScope.user.email,
                street: $rootScope.user.street,
                zipcode: $rootScope.user.area.zipcode
            };
        }
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'customer/setOrder', $scope.input).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Order successfully placed.");
                $rootScope.openOrdersPage();
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
