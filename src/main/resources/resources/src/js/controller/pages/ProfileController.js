//control profile update page
var ProfileController = ['$scope', '$rootScope', '$http', '$location','$uibModal', 'Upload', function ($scope, $rootScope, $http, $location,$uibModal, Upload) {
    $rootScope.top();

    $rootScope.getStatus(function(){
        $rootScope.checkIsLogged();
        $scope.input = {
            fullName: $rootScope.user.fullName,
            orgName: $rootScope.user.orgName,
            phone: $rootScope.user.phone,
            email: $rootScope.user.email,
            street: $rootScope.user.street,
            zipcode: $rootScope.user.area.zipcode,
            description: $rootScope.user.description
        };
    });


    $scope.uploadLink = null;
    $scope.editing = [];


    $scope.upload = function (file) {
        if (file) {
            Upload.upload({
                url: BASE_URL + 'uploadImg',
                file: file
            }).then(function (resp) {
                if (resp.data.status === "success") {
                    $scope.uploadLink = resp.data.payload;
                } else {
                    $rootScope.addErrorAlert();
                }
            }, $rootScope.addErrorAlert);
        }
    };

    $scope.removeUpload = function(input) {
        $scope.uploadLink = $scope.user.imgLink;
    };

    $scope.submit = function () {

        if ($scope.uploadLink !== null) {
            $scope.input.imgLink = $scope.uploadLink;
        }
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ($rootScope.isCustomer ? 'customer/update' : 'supplier/update'), $scope.input).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Successfully updated.");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
                $rootScope.reload();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };


    //show update password dialog and handle update password request
    $scope.openUpdatePasswordDialog = function() {
        $uibModal.open({
            animation: true,
            templateUrl: "modals/updatePassword.html",
            controller: UpdatePasswordDialogController
        });
    };


}];
