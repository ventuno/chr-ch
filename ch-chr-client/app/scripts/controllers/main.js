'use strict';

angular.module('chChrClientApp')
  .controller('MainCtrl', ['$scope', 'TwitterProfile', 'TwitterTimeline', function ($scope, TwitterProfile, TwitterTimeline) {
  	$scope.selectedUser = "";
  	$scope.numberOfTweets;
  	$scope.selectedUserTweets = [];
    $scope.fetchUserInfo = function () {
  		$scope.selectedUserProfile = TwitterProfile.get({twitterhandle: $scope.selectedUser});
  		$scope.selectedUserTweets = TwitterTimeline.get({twitterhandle: $scope.selectedUser, count: $scope.numberOfTweets});
  	};
  }]);
