'use strict';

angular.module('chChrClientApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'twitterServices',
  'twitterDirectives'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
