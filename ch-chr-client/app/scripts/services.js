var twitterServices = angular.module('twitterServices', ['ngResource']);

twitterServices.factory('TwitterProfile', ['$resource',
	function($resource){
    	return $resource('/api/twitter/profile/:twitterhandle', {}, {});
 }]);

twitterServices.factory('TwitterTimeline', ['$resource',
	function($resource){
    	return $resource('/api/twitter/timeline/:twitterhandle', {}, {
    		get: {method:'GET', isArray: true}
    	});
 }]);

twitterServices.factory('TwitterReputationScore', ['$resource',
	function($resource){
    	return $resource('/api/twitter/reputation_score/:twitterhandle', {}, {});
 }]);