var twitterServices = angular.module('twitterServices', ['ngResource']);
var CHTWITTER_API_BASE_URL = '/api/twitter/1.0'
twitterServices.factory('TwitterProfile', ['$resource',
	function($resource){
    	return $resource(CHTWITTER_API_BASE_URL + '/profile/:twitterhandle', {}, {});
 }]);

twitterServices.factory('TwitterTimeline', ['$resource',
	function($resource){
    	return $resource(CHTWITTER_API_BASE_URL + '/timeline/:twitterhandle', {}, {
    		get: {method:'GET', isArray: true}
    	});
 }]);

twitterServices.factory('TwitterReputationScore', ['$resource',
	function($resource){
    	return $resource(CHTWITTER_API_BASE_URL + '/reputation_score/:twitterhandle', {}, {});
 }]);