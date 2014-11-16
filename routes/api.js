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
	chtwitter.getTimeline(
		config.twitter.TWITTER_CUSTOMER_KEYs,
		config.twitter.TWITTER_CUSTOMER_SECRET,
		oHttpRequest.params.twitterhandle,
		oHttpRequest.query.count || 300,
		function (sErr, oData) {
			if (sErr)
				oHttpResponse.send(sErr);
			else 
				oHttpResponse.send(JSON.stringify(oData));
		}
	);
});

module.exports = router;
