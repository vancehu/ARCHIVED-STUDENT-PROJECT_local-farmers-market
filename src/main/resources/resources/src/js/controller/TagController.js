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
