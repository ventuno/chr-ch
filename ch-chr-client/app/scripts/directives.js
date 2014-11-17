angular.module('twitterDirectives', [])
.directive('tweet', function () {
	return {
		restrict: 'E',
		scope: {
			text: "=",
			date: "=",
			retweets: "=",
			picture: "="
		},
		templateUrl: '../views/tweetDirective.html'
	};
});