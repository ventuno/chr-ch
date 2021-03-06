'use strict';

angular.module('chChrClientApp')
  .controller('MainCtrl', ['$scope', 'TwitterProfile', 'TwitterTimeline', 'TwitterReputationScore', function ($scope, TwitterProfile, TwitterTimeline, TwitterReputationScore) {
  	$scope.selectedUser = "";
    $scope.reputationScore = "";
  	$scope.numberOfTweets;
  	$scope.startDateFilter = null;
  	$scope.endDateFilter = null;
  	$scope.selectedUserTweets;
    $scope.picturesFilter = false;
    $scope.minRetweets;
    $scope.fetchUserInfo = function () {
  		$scope.selectedUserProfile = TwitterProfile.get({
  			twitterhandle: $scope.selectedUser
  		},
        angular.noop,
        function () {
          $scope.selectedUserProfile = {errors:[{}]};
          $scope.selectedUserTweets = undefined;
        }
      );

      $scope.reputationScore = TwitterReputationScore.get({
        twitterhandle: $scope.selectedUser
      });

  		$scope.selectedUserTweets = TwitterTimeline.get({
  			twitterhandle: $scope.selectedUser,
  			count: $scope.numberOfTweets,
  			start_date: new Date($scope.startDateFilter).getTime() || 0,
  			end_date: new Date($scope.endDateFilter).getTime() || 0,
        with_pictures_only: $scope.picturesFilter,
        retweet_filter: $scope.minRetweets | 0
  		},
        angular.noop,
        function () {
          if (!$scope.selectedUserProfile.errors)
            $scope.selectedUserTweets = [];
      });
  	};
  }]);
