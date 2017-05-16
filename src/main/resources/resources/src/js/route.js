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



