//control update password dialog
var UpdatePasswordDialogController = ['$scope', '$rootScope', '$uibModalInstance', '$http', function ($scope, $rootScope, $uibModalInstance, $http) {
    $scope.input = {};
    $scope.wrongPassword = false;

    $scope.resetPassword = function () {
        $scope.input.oldPassword = undefined;
        $scope.form.oldPassword.$setPristine();
        $scope.form.oldPassword.$setUntouched();
        $scope.input.password = undefined;
        $scope.form.password.$setPristine();
        $scope.form.password.$setUntouched();
        $scope.form.password2.$setPristine();
        $scope.form.password2.$setUntouched();
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.submit = function () {
        //clear error status text
        $scope.wrongPassword = false;

        //hash password
        $scope.input.oldPassword = md5($scope.input.oldPassword);
        $scope.input.password = md5($scope.input.password);

        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ($rootScope.isCustomer ? 'customer/updatePassword' : 'supplier/register'), $scope.input).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Password updated.");
                $scope.cancel();
            } else if (resp.data.status === "wrongPassword") {
                $rootScope.addErrorAlert("Old password is incorrect.");
                $scope.resetPassword();
                $scope.wrongPassword = true;
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $scope.resetPassword();
        });
    };
}];