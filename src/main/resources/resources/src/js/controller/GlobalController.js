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
