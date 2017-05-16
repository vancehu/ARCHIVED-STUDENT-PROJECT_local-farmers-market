//control login dialog
var LoginDialogController = ['$scope', '$rootScope', '$uibModalInstance', '$http', 'parent', function ($scope, $rootScope, $uibModalInstance, $http, parent) {
    $scope.isCustomer = true;
    $scope.input = {};
    $scope.setIsCustomer = function (isCustomer) {
        $scope.isCustomer = isCustomer;
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };
    $scope.resetPassword = function () {
        $scope.input.password = undefined;
        $scope.form.password.$setPristine();
        $scope.form.password.$setUntouched();
    };
    $scope.demoSubmit = function (flag) {
        $scope.input.username = flag ? "customer0" : "supplier0";
        $scope.input.password = "tester";
        $scope.submit();
    };
    $scope.submit = function () {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ($scope.isCustomer ? 'customer/login' : 'supplier/login'), $scope.input).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.isCustomer = $scope.isCustomer;
                $rootScope.addSuccessAlert("Successfully logged in.");
                $uibModalInstance.dismiss("cancel");
                $rootScope.getStatus();
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert("Please check username and password and then try again.");
                $scope.resetPassword();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $scope.resetPassword();
        });
    };
    $scope.register = function () {
        $uibModalInstance.dismiss("cancel");
        parent.openRegisterDialog();
    };
}];
