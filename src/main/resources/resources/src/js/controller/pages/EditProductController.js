//control edit product page
var EditProductController= ['$rootScope', '$scope', '$routeParams', '$http', 'Upload',function($rootScope, $scope, $routeParams, $http, Upload){
    $rootScope.top();
    $rootScope.getStatus(function(){
        $rootScope.checkIsLogged();
        $rootScope.checkIsSupplier();
        $scope.getMyProduct();
    });


    $scope.uploadLink = null;
    $scope.editing = [];
    $scope.tagsArr = [];
    $scope.tagsArrIncludeParent = true;

    $scope.getMyProduct = function () {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'getProduct', $routeParams).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.product = resp.data.payload;
                $scope.input = {
                    name: $scope.product.name,
                    unitName: $scope.product.unitName,
                    currentPrice: $scope.product.currentPrice,
                    currentShippingPrice: $scope.product.currentShippingPrice,
                    availableQuantity: $scope.product.availableQuantity,
                    imgLink: $scope.product.imgLink,
                    description: $scope.product.description
                };
                $scope.uploadLink = $scope.product.imgLink;
                $scope.tagsArr = $scope.product.tags.map(function(obj){return obj.id});
                $scope.tagLoaded= true;
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

    $scope.submit = function () {

        if ($scope.uploadLink !== null) {
            $scope.input.imgLink = $scope.uploadLink;
        }
        $scope.input.id = $scope.product.id;
        $scope.input.tags = $scope.tagsArr.join(",");
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'supplier/updateProduct', $scope.input).then(function (resp) {
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


    $scope.removeUpload = function(input) {
        $scope.uploadLink = $scope.product.imgLink;
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