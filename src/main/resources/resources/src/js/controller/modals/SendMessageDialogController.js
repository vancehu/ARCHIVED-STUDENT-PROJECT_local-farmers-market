//control message sending dialog
var SendMessageDialogController = ['$scope', '$rootScope', '$http', '$uibModalInstance', 'target', function ($scope, $rootScope, $http, $uibModalInstance, target) {
    $scope.target = target;
    $scope.input = {};

    $scope.cancel = function () {
        $uibModalInstance.dismiss("cancel");
    };

    $scope.submit = function () {
        $rootScope.addPendingRequest();
        if ($rootScope.isCustomer) {
            $scope.input.supplierId = target.id;
        } else {
            $scope.input.customerId = target.id;
        }
        $http.post(BASE_URL + ($scope.isCustomer ? 'customer/sendMessage' : 'supplier/sendMessage'), $scope.input).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Message sent.");
                $scope.cancel();
            } else {
                $rootScope.addErrorAlert();
                $scope.cancel();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $scope.cancel();
        });
    };
}];