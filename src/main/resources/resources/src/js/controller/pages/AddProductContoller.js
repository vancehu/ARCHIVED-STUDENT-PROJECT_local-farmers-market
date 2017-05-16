//control add product page
var AddProductController =['$rootScope', '$scope', '$http', 'Upload', function ($rootScope, $scope, $http, Upload) {
    $rootScope.top();
    $rootScope.getStatus(function () {
        $rootScope.checkIsLogged();
        $rootScope.checkIsSupplier();
    });

    $scope.uploadLink = null;
    $scope.input = {};
    $scope.tagsArr = [];
    $scope.tagLoaded = true;
    $scope.tagsArrIncludeParent = true;

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
        $scope.uploadLink = null;
    };

    $scope.submit = function () {
        if ($rootScope.isCustomer) {
            return;
        }
        if ($scope.uploadLink !== null) {
            $scope.input.imgLink = $scope.uploadLink;
        }
        $scope.input.tags = $scope.tagsArr.join(",");
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('supplier/addProduct'), $scope.input).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Successfully updated.");
                $rootScope.reload();
                //TODO redirect
            } else {
                $rootScope.addErrorAlert();
                $rootScope.reload();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };

}];