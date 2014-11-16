'use strict';

angular.module('chChrClientApp')
  .controller('MainCtrl', ['$scope', 'TwitterProfile', 'TwitterTimeline', function ($scope, TwitterProfile, TwitterTimeline) {
  	$scope.selectedUser = "";
  	$scope.numberOfTweets = 10;
  	$scope.startDateFilter = null;
  	$scope.endDateFilter = null;
  	$scope.selectedUserTweets = [];
    $scope.fetchUserInfo = function () {
  		$scope.selectedUserProfile = TwitterProfile.get({
  			twitterhandle: $scope.selectedUser
  		});

  		$scope.selectedUserTweets = TwitterTimeline.get({
  			twitterhandle: $scope.selectedUser,
  			count: $scope.numberOfTweets,
  			start_date: new Date($scope.startDateFilter).getTime() || 0,
  			end_date: new Date($scope.endDateFilter).getTime() || 0
  		});
  	};
  }]);
