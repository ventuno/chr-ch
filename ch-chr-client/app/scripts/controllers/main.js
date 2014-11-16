'use strict';

angular.module('chChrClientApp')
  .controller('MainCtrl', ['$scope', 'TwitterProfile', 'TwitterTimeline', function ($scope, TwitterProfile, TwitterTimeline) {
  	$scope.selectedUser = "";
  	$scope.numberOfTweets;
  	$scope.startDateFilter = null;
  	$scope.endDateFilter = null;
  	$scope.selectedUserTweets = [];
    $scope.picturesFilter = false;
    $scope.minRetweets;
    $scope.fetchUserInfo = function () {
  		$scope.selectedUserProfile = TwitterProfile.get({
  			twitterhandle: $scope.selectedUser
  		});

  		$scope.selectedUserTweets = TwitterTimeline.get({
  			twitterhandle: $scope.selectedUser,
  			count: $scope.numberOfTweets,
  			start_date: new Date($scope.startDateFilter).getTime() || 0,
  			end_date: new Date($scope.endDateFilter).getTime() || 0,
        with_pictures_only: $scope.picturesFilter,
        retweet_filter: $scope.minRetweets | 0
  		});
  	};
  }]);
