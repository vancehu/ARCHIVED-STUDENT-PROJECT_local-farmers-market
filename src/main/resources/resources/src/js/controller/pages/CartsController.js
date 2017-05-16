//control cart page
var CartsController = ['$scope', '$http', '$location', '$rootScope', function ($scope, $http, $location, $rootScope) {
    $rootScope.top();
    $rootScope.getStatus(function (){
        $rootScope.checkIsCustomer();
        $scope.getCarts();
    });


    $scope.carts = [];
    $scope.priceChanged = [];
    $scope.shippingPriceChanged = [];
    $scope.quantityInvalid = [];
    $scope.editing = [];
    $scope.quantity = [];
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
                if ($scope.carts) {
                    for (var i = 0; i < $scope.carts.length; i++) {
                        $scope.totalPrice += parseFloat($scope.carts[i].price)*$scope.carts[i].quantity;
                        $scope.totalShippingPrice += parseFloat($scope.carts[i].shippingPrice)*$scope.carts[i].quantity;
                        $scope.priceChanged.push(($scope.carts[i].price !== $scope.carts[i].product.currentPrice));
                        $scope.shippingPriceChanged.push($scope.carts[i].shippingPrice !== $scope.carts[i].product.currentShippingPrice);
                        $scope.quantityInvalid.push($scope.carts[i].quantity > $scope.carts[i].product.availableQuantity);
                        $scope.editing.push(false);
                        $scope.quantity.push($scope.carts[i].quantity > $scope.carts[i].product.availableQuantity ?
                            $scope.carts[i].product.availableQuantity : $scope.carts[i].quantity);
                    }
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

    $scope.allValid = function () {
        if (!$scope.carts || $scope.carts.length === 0) {
            return false;
        }
        for (var i = 0; i < $scope.carts.length; i++) {
            if ($scope.priceChanged[i] || $scope.shippingPriceChanged[i] || $scope.quantityInvalid[i]) return false;
        }
        return true;
    };


    $scope.increaseQuantity = function (index) {
        $scope.quantity[index]++;
        if ($scope.quantity[index] > $scope.carts[index].product.availableQuantity) {
            $scope.quantity[index] = $scope.carts[index].product.availableQuantity;
        }
    };
    $scope.decreaseQuantity = function (index) {
        $scope.quantity[index]--;
        if ($scope.quantity[index] < 0) {
            $scope.quantity[index] = 0;
        }
    };
    $scope.changeQuantity = function (index) {
        if (isNaN($scope.quantity[index])) {
            $scope.quantity[index] = 0;
        } else {
            if (parseInt($scope.quantity[index]) < 0) {
                $scope.quantity[index] = 0;
            } else if ($scope.quantity[index] > $scope.carts[index].product.availableQuantity) {
                $scope.quantity[index] = $scope.carts[index].product.availableQuantity;
            }
        }
    };
    $scope.isQuantityChanged = function (index) {
        return $scope.carts && (parseInt($scope.quantity[index]) >= 0 &&
            parseInt($scope.quantity[index]) <= $scope.carts[index].product.availableQuantity &&
            parseInt($scope.quantity[index]) !== $scope.carts[index].quantity);
    };

    $scope.applyNewPrice = function (index) {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/updateCart'), {
            id: $scope.carts[index].product.id,
            quantity: $scope.carts[index].quantity
        }).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart updated");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };

    $scope.updateCart = function (index) {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/updateCart'), {
            id: $scope.carts[index].product.id,
            quantity: $scope.quantity[index]
        }).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart updated");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };
    $scope.removeCart = function (index) {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/removeCart'), {
            id: $scope.carts[index].product.id
        }).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart removed");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };

}];
