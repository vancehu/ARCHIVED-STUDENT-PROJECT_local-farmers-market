var BASE_URL = '';
var app = angular.module('starterApp', ['ngMessages', 'ngFileUpload', 'ngRoute', 'ngAnimate', 'ui.bootstrap']);

// Use x-www-form-urlencoded Content-Type instead of application/json
// referenced from:
// http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true;

    $httpProvider.defaults.headers.post['Content-Type'] =
        'application/x-www-form-urlencoded;charset=utf-8';
    var param = function(obj) {
        var query = '',
            name, value,
            fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            if (obj.hasOwnProperty(name)) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        if (value.hasOwnProperty(subName)) {
                            subValue = value[subName];
                            fullSubName = name + '[' + subName + ']';
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    }
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];

}]);

//control page routing
app.config(['$routeProvider', function ($routeProvider) {
    var DefaultController = ['$window','$rootScope', function ($window, $rootScope) {
        $rootScope.getStatus();
        $window.scrollTo(0, 0);
    }];
    $routeProvider.when('/', {
        templateUrl: 'pages/about.html',
        controller: DefaultController
    }).when('/tags', {
        templateUrl: 'pages/tags.html',
        controller: DefaultController
    }).when('/products/tags/:tags?/keyword/:keyword?/sort/:sort?/page/:page?', {
        templateUrl: 'pages/products.html',
        controller: ProductsController
    }).when('/product/:id', {
        templateUrl: 'pages/product.html',
        controller: ProductDetailController
    }).when('/cart', {
        templateUrl: "pages/cart.html",
        controller: CartsController
    }).when('/place', {
        templateUrl: "pages/place.html",
        controller: PlaceOrderController
    }).when('/notifications/:page', {
        templateUrl: 'pages/notifications.html',
        controller: NotificationsController
    }).when('/orders/:page', {
        templateUrl: 'pages/orders.html',
        controller: OrdersController
    }).when('/profile', {
        templateUrl: 'pages/profile.html',
        controller: ProfileController
    }).when('/addProduct', {
        templateUrl: 'pages/addProduct.html',
        controller: AddProductController
    }).when('/myProducts/:page', {
        templateUrl: 'pages/myProducts.html',
        controller: MyProductsController
    }).when('/editProduct/:id',{
        templateUrl: 'pages/editProduct.html',
        controller: EditProductController
    }).otherwise({
        redirectTo: '/'
    });
}]);

//global accessible navigate methods
app.run(function ($rootScope, $location, $route, $window) {
    $rootScope.back = function () {
        $window.history.back();
    };

    $rootScope.top = function () {
        $window.scrollTo(0, 0);
    };

    $rootScope.reload = function () {
        $route.reload();
    };
    $rootScope.home = function () {
        $location.path("/");
    };

    $rootScope.openProductDetailPage = function (id) {
        $location.path("product/" + id);
    };
    $rootScope.openCartPage = function () {
        $location.path("cart");
    };
    $rootScope.openPlacePage = function () {
        $location.path("place");
    };
    $rootScope.openOrdersPage = function () {
        $location.path("orders/1");
    };
    $rootScope.openProfilePage = function () {
        $location.path("profile");
    };
    $rootScope.openEditProductPage = function (id) {
        $location.path("editProduct/"+ id);
    };
});

//page restriction checkers
app.run(['$rootScope', '$timeout', function ($rootScope, $timeout) {
    $rootScope.checkIsCustomer = function () {
        if (!$rootScope.isCustomer) {
            $rootScope.addErrorAlert("Not accessible from supplier mode.");
            $rootScope.home();
        }
    };

    $rootScope.checkIsLogged = function () {
        if (!$rootScope.user) {
            $rootScope.addErrorAlert("Not accessible if not logged in.");
            $rootScope.home();
        }
    };

    $rootScope.checkIsSupplier = function () {
        if ($rootScope.isCustomer) {
            $rootScope.addErrorAlert("Not accessible from customer mode.");
            $rootScope.home();
        }
    }
}]);




//control pending request, alert and global accessible variables
app.controller('GlobalController', ['$rootScope', '$http', '$timeout', '$uibModal', function ($rootScope, $http, $timeout, $uibModal) {
    $rootScope.waitingRequest = 0;
    $rootScope.waiting = false;
    $rootScope.alerts = [];

    //load once and keep in memory
    $rootScope.areas = null;
    $rootScope.tags = null;
    $rootScope.sortedTags = [];


    $rootScope.addPendingRequest = function () {
        $rootScope.waitingRequest++;
        $rootScope.waiting = $rootScope.waitingRequest > 0;
    };
    $rootScope.removePendingRequest = function () {
        $rootScope.waitingRequest--;
        $rootScope.waiting = $rootScope.waitingRequest > 0;
    };

    $rootScope.addSuccessAlert = function (text) {
        $rootScope.alerts.push({
            msg: text,
            type: "success"
        });
    };
    $rootScope.addErrorAlert = function (text) {
        $rootScope.alerts.push({
            msg: text || "Unexpected error occurred. Please retry.",
            type: "danger"
        });
    };
    $rootScope.closeAlert = function (index) {
        $rootScope.alerts.splice(index, 1);
    };

    $rootScope.getAreas = function () {
        $http.post(BASE_URL + ('getAreas'), null).then(function (resp) {
            if (resp.data.status === "success") {
                $rootScope.areas = resp.data.payload;
            } else {
                //invalid response, retry after 5 seconds
                $timeout(function () {
                    $rootScope.getAreas();
                }, 5000);
            }
        }, function () {
            //failed to response, retry after 5 seconds
            $timeout(function () {
                $rootScope.getAreas();
            }, 5000);
        });
    };
    $rootScope.getAreas();

    $rootScope.getTags = function () {
        $http.post(BASE_URL + ('getTags'), null).then(function (resp) {
            if (resp.data.status === "success") {
                $rootScope.tags = resp.data.payload;
                //convert tag list to tree structure
                var el;
                for (var i = 0; i < $rootScope.tags.length; i++) {
                    el = $rootScope.tags[i];
                    if (el.parentId === -1) {
                        $rootScope.sortedTags.push({
                            id: el.id,
                            name: el.name,
                            imgLink: el.imgLink,
                            childs: []
                        });
                    } else {
                        $rootScope.sortedTags[el.parentId - 1].childs.push({
                            id: el.id,
                            name: el.name,
                            selected: false
                        });
                    }
                }
            } else {
                //invalid response, retry after 5 seconds
                $timeout(function () {
                    $rootScope.getTags();
                }, 5000);
            }
        }, function () {
            //failed to response, retry after 5 seconds
            $timeout(function () {
                $rootScope.getTags();
            }, 5000);
        });
    };
    $rootScope.getTags();

    //open message dialog
    $rootScope.openSendMessageDialog = function (target) {
        $uibModal.open({
            animation: true,
            templateUrl: "modals/sendMessage.html",
            controller: SendMessageDialogController,
            resolve: {
                target: target
            }
        });
    };


    //get current logged user status, unread count and cart count. Then execute callback
    $rootScope.getStatus = function (callback) {
        $http.post(BASE_URL + ('getStatus'), null).then(function (resp) {
            if (resp.data.status === "success") {
                //have logged user info
                $rootScope.user = resp.data.payload.user;
                $rootScope.isCustomer = resp.data.payload.isCustomer;
                $rootScope.unreadCount = resp.data.payload.unreadCount;
                if (callback) {
                    callback();
                }

            } else {
                //don't have logged customer info
                $rootScope.user = null;
                $rootScope.isCustomer = true;
            }
            if ($rootScope.isCustomer) {
                $http.post(BASE_URL + 'customer/countCarts', null).then(function (resp) {
                    if (resp.data.status === "success") {
                        $rootScope.cartsCount = resp.data.payload;
                    }
                }, null);
            }
        }, function () {
            //failed to response, retry after 5 seconds
            $timeout(function () {
                $rootScope.getStatus();
            }, 5000);
        });
    };
}]);

//automatically dock the navigation bar when scrolling down
app.controller('NavbarController', ['$window', '$scope', '$location',function ($window, $scope, $location) {
    $scope.dockMode = false;
    angular.element($window).on('scroll', function () {
        $scope.$apply(function () {
            $scope.dockMode = $window.scrollY > 100;
        });
    });
    $scope.openProductsPage = function(keyword){
        $location.path("products/tags/keyword/"+ encodeURIComponent(keyword) +"/sort/page");
        $scope.search = "";
    };
}]);

//Tag selector for advanced product search and product creation
//use $rootScope.sortedTags as temporary storage
app.controller('TagSelectorController', ['$rootScope', '$scope', function($rootScope, $scope) {
    $scope.filter = "";

    $scope.clearTags = function() {
        for (var i = 0; i < $rootScope.sortedTags.length; i++) {
            $rootScope.sortedTags[i].selected = false;
            for (var j = 0; j < $rootScope.sortedTags[i].childs.length; j++) {
                $rootScope.sortedTags[i].childs[j].selected = false;
            }
        }
    };


    $scope.addTags = function() {

        var findAt;
        for (var i = 0; i < $rootScope.sortedTags.length; i++) {
            //clone
            var arr = $scope.$parent.tagsArr.slice(0);
            for (var j = 0; j < $rootScope.sortedTags[i].childs.length; j++) {
                findAt = arr.indexOf($rootScope.sortedTags[i].childs[j].id);
                if (findAt != -1) {
                    $rootScope.sortedTags[i].childs[j].selected = true;
                    arr.splice(findAt, 1);
                }
            }
            findAt = arr.indexOf($rootScope.sortedTags[i].id);
            if (findAt !== -1) {
                if(!$scope.$parent.tagsArrIncludeParent) {
                    if ($scope.childNodeSelected($rootScope.sortedTags[i]) >= 0) {
                        //if child nodes are partially or all selected, then deselect all first
                        for (j = 0; j < $rootScope.sortedTags[i].childs.length; j++) {
                            $rootScope.sortedTags[i].childs[j].selected = false;
                        }
                    }
                    for (j = 0; j < $rootScope.sortedTags[i].childs.length; j++) {
                        $rootScope.sortedTags[i].childs[j].selected = true;
                    }
                }
                arr.splice(findAt, 1);
            }
            if (arr.length === 0) {
                return;
            }
        }
    };


    $scope.removeTagByIndex = function(i) {
        $scope.$parent.tagsArr.splice(i, 1);
        $scope.clearTags();
        $scope.addTags();
    };

    $scope.updateArray = function() {
        $scope.$parent.tagsArr.length = 0;
        for (var i = 0; i < $rootScope.sortedTags.length; i++) {
            if ($scope.childNodeSelected($rootScope.sortedTags[i]) === 1) {
                $scope.$parent.tagsArr.push($rootScope.sortedTags[i].id);
            } else if ($scope.childNodeSelected($rootScope.sortedTags[i]) === 0) {
                if($scope.$parent.tagsArrIncludeParent){
                    $scope.$parent.tagsArr.push($rootScope.sortedTags[i].id);
                }
                for (var j = 0; j < $rootScope.sortedTags[i].childs.length; j++) {
                    if ($rootScope.sortedTags[i].childs[j].selected) {
                        $scope.$parent.tagsArr.push($rootScope.sortedTags[i].childs[j].id);
                    }
                }
            }
        }
    };

    $scope.childNodeSelected = function(parent) {
        var selectCount = 0;
        for (var i = 0; i < parent.childs.length; i++) {
            if (parent.childs[i].selected) {
                selectCount++;
            }
        }
        if (selectCount === 0) {
            return -1; //none selected
        } else if (selectCount < parent.childs.length) {
            return 0; //partially selected
        } else {
            return 1; //all selected
        }
    };

    $scope.parentNodeClick = function(parent) {
        var i;
        switch ($scope.childNodeSelected(parent)) {
            case -1:
                for (i = 0; i < parent.childs.length; i++) {
                    parent.childs[i].selected = true;
                }
                break;
            case 0:
            case 1:
                for (i = 0; i < parent.childs.length; i++) {
                    parent.childs[i].selected = false;
                }
                break;
        }
        $scope.updateArray();
    };

    $scope.childNodeClick = function(child) {
        child.selected = !child.selected;
        $scope.updateArray();
    };


    $scope.filtered = function(tag) {
        if ($scope.filter === "") return false;
        return tag.name.toLowerCase().indexOf($scope.filter.toLowerCase()) === -1;
    };

    $scope.allChildsFiltered = function(parent) {
        if ($scope.filter === "") return false;
        for (var i = 0; i < parent.childs.length; i++) {
            if (parent.childs[i].name.toLowerCase().indexOf($scope.filter.toLowerCase()) !== -1) {
                return false;
            }
        }
        return true;
    };

    $scope.$parent.$watch('tagLoaded', function(tagLoaded){
        if(tagLoaded) {
            $scope.clearTags();
            $scope.addTags();
            $scope.updateArray();
        }
    });

}]);

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

//password matching validator for register/password updating
app.directive('matchPassword', function() {
    'use strict';
    return {
        require: 'ngModel',
        scope: {
            otherModelValue: '=matchPassword'
        },
        link: function(scope, element, attrs, model) {
            model.$validators.matchPassword = function(modelValue) {
                return modelValue === scope.otherModelValue;
            };

            scope.$watch('otherModelValue', function() {
                model.$validate();
            });
        }
    };
});

//return correct image url
app.filter('getImage', function () {
    return function (imgLink) {
        if (imgLink === undefined || imgLink === null) {
            return BASE_URL + 'image/default.png';
        }
        return BASE_URL + ' image/' + imgLink;
    };
});

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
//control cart page
var CartsController = ['$scope', '$http', '$location', '$rootScope', function ($scope, $http, $location, $rootScope) {
    $rootScope.top();
    $rootScope.getStatus(function (){
        $rootScope.checkIsCustomer();
        $scope.getCarts();
    });


    $scope.carts = [];
    $scope.priceChanged = [];
    $scope.shippingPriceChanged = [];
    $scope.quantityInvalid = [];
    $scope.editing = [];
    $scope.quantity = [];
    $scope.totalPrice = 0;
    $scope.totalShippingPrice = 0;

    $scope.getCarts = function () {
        var query = {
            id: $scope.id
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'customer/getCarts', query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.carts = resp.data.payload;
                if ($scope.carts) {
                    for (var i = 0; i < $scope.carts.length; i++) {
                        $scope.totalPrice += parseFloat($scope.carts[i].price)*$scope.carts[i].quantity;
                        $scope.totalShippingPrice += parseFloat($scope.carts[i].shippingPrice)*$scope.carts[i].quantity;
                        $scope.priceChanged.push(($scope.carts[i].price !== $scope.carts[i].product.currentPrice));
                        $scope.shippingPriceChanged.push($scope.carts[i].shippingPrice !== $scope.carts[i].product.currentShippingPrice);
                        $scope.quantityInvalid.push($scope.carts[i].quantity > $scope.carts[i].product.availableQuantity);
                        $scope.editing.push(false);
                        $scope.quantity.push($scope.carts[i].quantity > $scope.carts[i].product.availableQuantity ?
                            $scope.carts[i].product.availableQuantity : $scope.carts[i].quantity);
                    }
                }
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

    $scope.allValid = function () {
        if (!$scope.carts || $scope.carts.length === 0) {
            return false;
        }
        for (var i = 0; i < $scope.carts.length; i++) {
            if ($scope.priceChanged[i] || $scope.shippingPriceChanged[i] || $scope.quantityInvalid[i]) return false;
        }
        return true;
    };


    $scope.increaseQuantity = function (index) {
        $scope.quantity[index]++;
        if ($scope.quantity[index] > $scope.carts[index].product.availableQuantity) {
            $scope.quantity[index] = $scope.carts[index].product.availableQuantity;
        }
    };
    $scope.decreaseQuantity = function (index) {
        $scope.quantity[index]--;
        if ($scope.quantity[index] < 0) {
            $scope.quantity[index] = 0;
        }
    };
    $scope.changeQuantity = function (index) {
        if (isNaN($scope.quantity[index])) {
            $scope.quantity[index] = 0;
        } else {
            if (parseInt($scope.quantity[index]) < 0) {
                $scope.quantity[index] = 0;
            } else if ($scope.quantity[index] > $scope.carts[index].product.availableQuantity) {
                $scope.quantity[index] = $scope.carts[index].product.availableQuantity;
            }
        }
    };
    $scope.isQuantityChanged = function (index) {
        return $scope.carts && (parseInt($scope.quantity[index]) >= 0 &&
            parseInt($scope.quantity[index]) <= $scope.carts[index].product.availableQuantity &&
            parseInt($scope.quantity[index]) !== $scope.carts[index].quantity);
    };

    $scope.applyNewPrice = function (index) {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/updateCart'), {
            id: $scope.carts[index].product.id,
            quantity: $scope.carts[index].quantity
        }).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart updated");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };

    $scope.updateCart = function (index) {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/updateCart'), {
            id: $scope.carts[index].product.id,
            quantity: $scope.quantity[index]
        }).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart updated");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };
    $scope.removeCart = function (index) {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/removeCart'), {
            id: $scope.carts[index].product.id
        }).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart removed");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };

}];

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
//control my products page
var MyProductsController= ['$rootScope', '$scope', '$routeParams', '$http','$location', function($rootScope, $scope, $routeParams, $http,$location){
    $rootScope.top();
    $rootScope.getStatus(function () {
        $rootScope.checkIsLogged();
        $rootScope.checkIsSupplier();
        $scope.countMyProducts();
        $scope.getMyProducts();
    });

    $scope.tagsArr = [];
    $scope.tagsArrIncludeParent = true;
    $scope.currPage = $routeParams.page;
    $scope.myProducts = [];
    $scope.myProductsCount = 0;
    
    $scope.tracking = [];

    $scope.loadPage = function () {
        if ($scope.page !== $scope.currPage) {
            $location.path("myProducts/" + $scope.page);
        }
    };

    $scope.countMyProducts = function () {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ( 'supplier/countMyProducts'), null).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.myProductsCount = resp.data.payload;
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

    $scope.getMyProducts = function () {

        var query = {
            page: $scope.currPage
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'supplier/getMyProducts', query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.myProducts = resp.data.payload;
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

}];
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

//control cart page
var PlaceOrderController = ['$scope', '$http', '$location', '$rootScope',function ($scope, $http, $location, $rootScope) {
    $rootScope.top();
    $rootScope.getStatus(function(){
        $rootScope.checkIsCustomer();
        $rootScope.checkIsLogged();
        $scope.getCarts();
    });

    $scope.carts = [];
    $scope.input = {};
    $scope.sameAddress = true;
    $scope.totalPrice = 0;
    $scope.totalShippingPrice = 0;

    $scope.getCarts = function () {
        var query = {
            id: $scope.id
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'customer/getCarts', query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.carts = resp.data.payload;
                for (var i = 0; i < $scope.carts.length; i++) {
                    $scope.totalPrice += parseFloat($scope.carts[i].price)*$scope.carts[i].quantity;
                    $scope.totalShippingPrice += parseFloat($scope.carts[i].shippingPrice)*$scope.carts[i].quantity;
                }
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


    $scope.allowSubmit = function () {
        if (!$rootScope.user || !$scope.carts || $scope.carts.length === 0) return false;
        if (!$scope.sameAddress) {
            return $scope.form.$valid;
        }
        return true;
    };

    $scope.placeOrder = function () {
        if ($scope.sameAddress) {
            $scope.input = {
                fullName: $rootScope.user.fullName,
                orgName: $rootScope.user.orgName,
                phone: $rootScope.user.phone,
                email: $rootScope.user.email,
                street: $rootScope.user.street,
                zipcode: $rootScope.user.area.zipcode
            };
        }
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'customer/setOrder', $scope.input).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Order successfully placed.");
                $rootScope.openOrdersPage();
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
}];

//control product detail page
var ProductDetailController =[ '$scope', '$http', '$routeParams', '$rootScope', function($scope, $http, $routeParams, $rootScope) {
    $rootScope.top();
    $rootScope.getStatus();

    $scope.product = null;
    $scope.quantity = 0;
    $scope.cart = null;

    $scope.id = $routeParams.id;

    $scope.getProduct = function() {
        var query = {
            id: $scope.id
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'getProduct', query).then(function(resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.product = resp.data.payload;
                $scope.getCart();
            } else {
                $rootScope.addErrorAlert();
                $rootScope.home();
            }
        }, function() {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
            $rootScope.home();
        });

    };
    $scope.getProduct();

    $scope.increaseQuantity = function() {
        $scope.quantity++;
        if ($scope.quantity > $scope.product.availableQuantity) {
            $scope.quantity = $scope.product.availableQuantity;
        }
    };
    $scope.decreaseQuantity = function() {
        $scope.quantity--;
        if ($scope.quantity < 0) {
            $scope.quantity = 0;
        }
    };
    $scope.changeQuantity = function() {
        if (isNaN($scope.quantity)) {
            $scope.quantity = 0;
        } else {
            if (parseInt($scope.quantity) < 0) {
                $scope.quantity = 0;
            } else if ($scope.quantity > $scope.product.availableQuantity) {
                $scope.quantity = $scope.product.availableQuantity;
            }
        }
    };
    $scope.isQuantityValid = function() {
        return parseInt($scope.quantity) > 0 && parseInt($scope.quantity) <= $scope.product.availableQuantity;
    };

    $scope.isQuantityChanged = function() {
        return $scope.cart && (parseInt($scope.quantity) >= 0 && parseInt($scope.quantity) <= $scope.product.availableQuantity && parseInt($scope.quantity) !== $scope.cart.quantity);
    };
    $scope.getCart = function() {
        if (!$rootScope.isCustomer) {
            return;
        }
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/getCart'), {
            id: $scope.product.id
        }).then(function(resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.cart = resp.data.payload;
                $scope.quantity = $scope.cart.quantity;
            } else if (resp.data.status === "notFound") {
                $scope.cart = null;
            } else {
                $rootScope.addErrorAlert();
            }
        }, function() {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };
    $scope.updateCart = function() {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/updateCart'), {
            id: $scope.product.id,
            quantity: $scope.quantity
        }).then(function(resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart updated");
                $rootScope.reload();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function() {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };
    $scope.removeCart = function() {
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + ('customer/removeCart'), {
            id: $scope.product.id
        }).then(function(resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $rootScope.addSuccessAlert("Cart removed");
                $scope.getCart();
            } else {
                $rootScope.addErrorAlert();
            }
        }, function() {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };



}];

//control product list page
var ProductsController = ['$scope', '$http', '$rootScope', '$routeParams', '$location', function ($scope, $http, $rootScope, $routeParams, $location) {
    $rootScope.top();
    $rootScope.getStatus();

    $scope.tagsArr = $routeParams.tags ? $routeParams.tags.split(',').map(function (v) {
        return parseInt(v);
    }) : [];
    $scope.tagLoaded = true;
    $scope.currPage = $routeParams.page || 1;
    $scope.keyword = decodeURIComponent($routeParams.keyword || "") ;
    $scope.sort = $routeParams.sort || '0';
    $scope.products = [];
    $scope.productsCount = 0;

    $scope.countProducts = function () {
        var query = {
            tags: $scope.tagsArr.length > 0 ? $scope.tagsArr.join(",") : null,
            keyword: $routeParams.keyword
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'countProducts', query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.productsCount = resp.data.payload;
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
    $scope.countProducts();

    $scope.getProducts = function () {
        var query = {
            tags: $scope.tagsArr.length > 0 ? $scope.tagsArr.join(",") : null,
            keyword: $routeParams.keyword,
            sort: $routeParams.sort,
            page: $scope.currPage
        };
        $rootScope.addPendingRequest();
        $http.post(BASE_URL + 'getProducts', query).then(function (resp) {
            $rootScope.removePendingRequest();
            if (resp.data.status === "success") {
                $scope.products = resp.data.payload;
            } else {
                $rootScope.addErrorAlert();
            }
        }, function () {
            $rootScope.removePendingRequest();
            $rootScope.addErrorAlert();
        });
    };
    $scope.getProducts();


    $scope.loadPage = function() {
        if ($scope.page !== $scope.currPage) {
            $location.path("products/tags/" + ($routeParams.tags||"") + "/keyword/" + ($routeParams.keyword||"") + "/sort/" + ($routeParams.sort||"") + "/page/" + $scope.page);

        }
    };

    $scope.applySearch = function () {
        if ($scope.keyword === "") {
            $scope.keyword = null;
        }
        $location.path("products/tags/" + $scope.tagsArr.join(",") + ($scope.tagsArr.length > 0 ? "/" : "") + "keyword/" + ($scope.keyword ? encodeURIComponent($scope.keyword) + "/" : "") + "sort" + ($scope.sort ? "/" + $scope.sort + "/" : "") + "page/1");
    };


}];

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
