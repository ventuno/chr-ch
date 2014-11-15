var express = require('express');
var router = express.Router();

var chtwitter = require('../local_modules/ch-twitter');
var config = require('../config');

/* GET api listing. */
router.get('/profile/:twitterhandle', function(oHttpRequest, oHttpResponse, fnNext) {
	oHttpResponse.setHeader('Content-Type', 'application/json');
	chtwitter.query(
		config.twitter.TWITTER_CUSTOMER_KEY,
		config.twitter.TWITTER_CUSTOMER_SECRET,
		"/1.1/users/show.json",
		{
			screen_name: oHttpRequest.params.twitterhandle
		},
		function (sErr, oData) {
			oHttpResponse.send(JSON.stringify(oData));
		}
	);
});

router.get('/timeline/:twitterhandle', function (oHttpRequest, oHttpResponse, fnNext) {
	oHttpResponse.setHeader('Content-Type', 'application/json');
	chtwitter.query(
		config.twitter.TWITTER_CUSTOMER_KEY,
		config.twitter.TWITTER_CUSTOMER_SECRET,
		"/1.1/statuses/user_timeline.json",
		{
			count: oHttpRequest.query.count || 10,
			screen_name: oHttpRequest.params.twitterhandle
		},
		function (sErr, oData) {
			oHttpResponse.send(JSON.stringify(oData));
		}
	);
});

module.exports = router;
