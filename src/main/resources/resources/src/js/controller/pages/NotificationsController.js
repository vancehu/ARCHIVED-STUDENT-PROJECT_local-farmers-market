//control my notification page
var NotificationsController = [ '$scope', '$rootScope', '$http', '$location', '$routeParams', function ( $scope, $rootScope, $http, $location, $routeParams) {
    $rootScope.top();
    $rootScope.getStatus(function(){
        $rootScope.checkIsLogged();
        $scope.countNotifications();
        $scope.getNotifications();
    });


    $scope.currPage = $routeParams.page;
    $scope.notifications = [];
    $scope.notificationsCount = 0;
    $scope.showAddress = [];
    $scope.showCancelRequest = [];
    $scope.cancelReason = [];

    $scope.loadPage = function () {
        if ($scope.page !== $scope.currPage) {
            $location.path("notifications/" + $scope.page);
        }
    };

    $scope.countNotifications = function () {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL +( $rootScope.isCustomer ? 'customer/countNotifications' : 'supplier/countNotifications'), null).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.notificationsCount = resp.data.payload;
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

    $scope.getNotifications = function () {
        var query = {
            page: $scope.currPage
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL +( $rootScope.isCustomer ? 'customer/getNotifications' : 'supplier/getNotifications'), query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.notifications = resp.data.payload;
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

    $scope.mark = function (index, hasRead) {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL +( $rootScope.isCustomer ? 'customer/markNotification' : 'supplier/markNotification'), {
            id: $scope.notifications[index].id,
            hasRead: hasRead
        }).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.addSuccessAlert("Notification marked as " + (hasRead ? "read." : "unread."));
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
    $scope.markAndOpenOrdersPage = function (index) {
        $scope.mark(index, true);
        $rootScope.openOrdersPage();
    };


}];
