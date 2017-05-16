//control register dialog
var RegisterDialogController=['$scope', '$rootScope', '$uibModalInstance','$http', 'Upload', 'parent',function($scope, $rootScope, $uibModalInstance, $http, Upload, parent) {
    $scope.isCustomer = true;
    $scope.input = {};
    $scope.hasUsername = false;
    $scope.hasEmail = false;
    $scope.uploadLink = null;

    $scope.setIsCustomer = function(isCustomer) {
        $scope.isCustomer = isCustomer;
    };

    $scope.upload = function(file) {
        if (file) {
            Upload.upload({
                url: BASE_URL + 'uploadImg',
                file: file
            }).then(function(resp) {
                if (resp.data.status === "success") {
                    $scope.uploadLink = resp.data.payload;
                } else {
                    $rootScope.addErrorAlert();
                }
            }, $rootScope.addErrorAlert);
        }
    };

    $scope.removeUpload = function(input) {
        $scope.uploadLink = null;
    };

    $scope.resetPassword = function() {
        $scope.input.password = undefined;
        $scope.form.password.$setPristine();
        $scope.form.password.$setUntouched();
        $scope.form.password2.$setPristine();
        $scope.form.password2.$setUntouched();
    };


    $scope.submit = function() {
        //clear error status text
        $scope.hasUsername = false;
        $scope.hasEmail = false;
        if ($scope.uploadLink) {
            $scope.input.imgLink = $scope.uploadLink;
        }
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ($scope.isCustomer ? 'customer/register' : 'supplier/register'), $scope.input).then(function(resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Successfully registered.");
                parent.openLoginDialog();
            } else if (resp.data.status === "hasUsername") {
                $rootScope.addErrorAlert("Username is already taken. Please try another one.");
                $scope.resetPassword();
                $scope.input.username = undefined;
                $scope.hasUsername = true;
            } else if (resp.data.status === "hasEmail") {
                $rootScope.addErrorAlert("Email address is already taken. Please try another one.");
                $scope.resetPassword();
                $scope.input.email = undefined;
                $scope.hasEmail = true;
            }else{
                $rootScope.addErrorAlert();
                $scope.resetPassword();
            }
        }, function() {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $scope.resetPassword();
        });
    };

    $scope.login = function() {
        $uibModalInstance.dismiss("cancel");
        parent.openLoginDialog();
    };
    $scope.cancel = function() {
        $uibModalInstance.dismiss("cancel");
    };
}];