//control order  page
var OrdersController = ['$scope', '$http', '$location', '$rootScope', '$routeParams', '$route', '$window', function ($scope, $http, $location, $rootScope, $routeParams, $route, $window) {
    $rootScope.top();
    $rootScope.getStatus(function(){
        $rootScope.checkIsLogged();
        $scope.countOrders();
        $scope.getOrders();
    });

    $scope.currPage = $routeParams.page;
    $scope.orders = [];
    $scope.ordersCount = 0;
    $scope.showAddress = [];
    $scope.showCancelRequest = [];
    $scope.cancelReason = [];
    $scope.showShipRequest = [];
    $scope.tracking = [];

    $scope.loadPage = function () {
        if ($scope.page !== $scope.currPage) {
            $location.path("orders/" + $scope.page);
        }
    };

    $scope.countOrders = function () {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ( $rootScope.isCustomer ? 'customer/countOrders' : 'supplier/countOrders'), null).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.ordersCount = resp.data.payload;
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


    $scope.getOrders = function () {
        var query = {
            page: $scope.currPage
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ( $rootScope.isCustomer ? 'customer/getOrders' : 'supplier/getOrders'), query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.orders = resp.data.payload;
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

    $scope.orderStatus = function (index) {
        var order = $scope.orders[index];
        if (order.shipped) {
            return "shipped";
        } else {
            if (order.cancel) {
                return "cancelled";
            } else {
                return "processing";
            }
        }
    };

    $scope.cancelRequest = function (index) {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ( $rootScope.isCustomer ? 'customer/cancelOrder' : 'supplier/cancelOrder'), {
            id: $scope.orders[index].id,
            cancelReason: $scope.cancelReason[index]
        }).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.addSuccessAlert("Order cancelled.");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
                $rootScope.reload();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $rootScope.reload();
        });
    };

    $scope.shipOrder = function (index) {
        if ($rootScope.isCustomer) {
            return;
        }
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ( 'supplier/shipOrder'), {
            id: $scope.orders[index].id,
            tracking: $scope.tracking[index]
        }).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.addSuccessAlert("Order shipped.");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
                $rootScope.reload();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $rootScope.reload();
        });

    }
}];
