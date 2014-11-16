var express = require('express');
var router = express.Router();

var chtwitter = require('../local_modules/ch-twitter');
//var chtsentanalysis = require('ch-sent-analysis');
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
	var bWithPicturesOnly = oHttpRequest.query.with_pictures_only == "true";
	var iMinRetweets = parseInt(oHttpRequest.query.min_retweets) || 0;
	oHttpResponse.setHeader('Content-Type', 'application/json');

	chtwitter.getTimeline(
		config.twitter.TWITTER_CUSTOMER_KEY,
		config.twitter.TWITTER_CUSTOMER_SECRET,
		oHttpRequest.params.twitterhandle,
		parseInt(oHttpRequest.query.count) || config.twitter.MAX_TWEETS_COUNT,
		parseInt(oHttpRequest.query.start_date) || 0,
		parseInt(oHttpRequest.query.end_date) || 0,
		function (sErr, oData) {
			if (sErr)
				oHttpResponse.send(sErr);
			else {
				var oFilteredData = [];
				for (var i = 0; i < oData.length; i++) {
					var oTweet = oData[i];
					//TODO, think about optimizing this and put it in the main api call (e.g.: we shouldn't loop through tweets too many times)
					if (bWithPicturesOnly || iMinRetweets > 0) {
						var bToFilterOutPics = true;
						var bToFilterOutRetweets = true;
						//at this point, if the following if is true, we should be pretty sure that the tweet contains a picture
						//in the future, if twitter enables sending videos and other media types this code could fail
						//for now, I'd avoid looping through each media to verify that it's type="photo"
						if (bWithPicturesOnly) {
							if (oTweet.entities && oTweet.entities.media && oTweet.entities.media.length > 0)
								bToFilterOutPics = false;
							else
								bToFilterOutPics = true;
						} 
						if (oTweet.retweet_count >= iMinRetweets) {
							bToFilterOutRetweets = false;
						} else {
							bToFilterOutRetweets = true;
						}
						if (!bToFilterOutPics && !bToFilterOutRetweets)
							oFilteredData.push(oTweet);
					} else {
						oFilteredData.push(oTweet);
					}
					//compute score
				}
				oData = oFilteredData;
				oHttpResponse.send(JSON.stringify(oData));
			}
				
		}
	);
});

module.exports = router;
