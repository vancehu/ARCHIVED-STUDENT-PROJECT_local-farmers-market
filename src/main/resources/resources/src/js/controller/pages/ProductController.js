//control product detail page
var ProductDetailController =[ '$scope', '$http', '$routeParams', '$rootScope', function($scope, $http, $routeParams, $rootScope) {
    $rootScope.top();
    $rootScope.getStatus();

    $scope.product = null;
    $scope.quantity = 0;
    $scope.cart = null;

    $scope.id = $routeParams.id;

    $scope.getProduct = function() {
        var query = {
            id: $scope.id
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'getProduct', query).then(function(resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.product = resp.data.payload;
                $scope.getCart();
            } else {
                $rootScope.addErrorAlert();
                $rootScope.home();
            }
        }, function() {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $rootScope.home();
        });

    };
    $scope.getProduct();

    $scope.increaseQuantity = function() {
        $scope.quantity++;
        if ($scope.quantity > $scope.product.availableQuantity) {
            $scope.quantity = $scope.product.availableQuantity;
        }
    };
    $scope.decreaseQuantity = function() {
        $scope.quantity--;
        if ($scope.quantity < 0) {
            $scope.quantity = 0;
        }
    };
    $scope.changeQuantity = function() {
        if (isNaN($scope.quantity)) {
            $scope.quantity = 0;
        } else {
            if (parseInt($scope.quantity) < 0) {
                $scope.quantity = 0;
            } else if ($scope.quantity > $scope.product.availableQuantity) {
                $scope.quantity = $scope.product.availableQuantity;
            }
        }
    };
    $scope.isQuantityValid = function() {
        return parseInt($scope.quantity) > 0 && parseInt($scope.quantity) <= $scope.product.availableQuantity;
    };

    $scope.isQuantityChanged = function() {
        return $scope.cart && (parseInt($scope.quantity) >= 0 && parseInt($scope.quantity) <= $scope.product.availableQuantity && parseInt($scope.quantity) !== $scope.cart.quantity);
    };
    $scope.getCart = function() {
        if (!$rootScope.isCustomer) {
            return;
        }
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/getCart'), {
            id: $scope.product.id
        }).then(function(resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.cart = resp.data.payload;
                $scope.quantity = $scope.cart.quantity;
            } else if (resp.data.status === "notFound") {
                $scope.cart = null;
            } else {
                $rootScope.addErrorAlert();
            }
        }, function() {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };
    $scope.updateCart = function() {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/updateCart'), {
            id: $scope.product.id,
            quantity: $scope.quantity
        }).then(function(resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart updated");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function() {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };
    $scope.removeCart = function() {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/removeCart'), {
            id: $scope.product.id
        }).then(function(resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart removed");
                $scope.getCart();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function() {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };



}];
