//control user related actions (get current status, login, logout and register)
app.controller('UserController', ['$rootScope', '$scope', '$http', '$timeout', '$uibModal', function ($rootScope, $scope, $http, $timeout, $uibModal) {
    $rootScope.isCustomer = true;
    $rootScope.user = null;

    //open login dialog and handle login request
    $scope.openLoginDialog = function () {
        $uibModal.open({
            animation: true,
            templateUrl: "modals/login.html",
            controller: LoginDialogController,
            resolve: {
                parent: $scope
            }
        });
    };

    //show register dialog and handle register request
    $scope.openRegisterDialog = function () {
        $uibModal.open({
            animation: true,
            templateUrl: "modals/register.html",
            controller: RegisterDialogController,
            resolve: {
                parent: $scope
            }
        });
    };

    //logout
    $scope.logout = function () {
        $http.post(BASE_URL + ($rootScope.isCustomer ? 'customer/logout' : 'supplier/logout'), null).then(function (resp) {
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Successfully logged out.");
                $rootScope.getStatus();
                $rootScope.home();
            } else {
                $rootScope.removePendingRequest();
                $rootScope.addErrorAlert();
                $rootScope.home();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $rootScope.home();
        });
    };
}]);
