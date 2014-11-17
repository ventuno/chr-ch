var express = require('express');
var router = express.Router();

var chtwitter = require('../local_modules/ch-twitter');
var chtsentanalysis = require('../local_modules/ch-sent-analysis');
var config = require('../config');

function _computeReputationScore (oUserProfile, aTweets) {
	var iNegativeTweets = 0;
	var iPositiveTweets = 0;
	var iTotalTweets = aTweets.length;
	var iTotalRetweets = 0;
	var iAverageFollowersNumber = 208; //http://www.telegraph.co.uk/technology/news/9601327/Average-Twitter-user-is-an-an-American-woman-with-an-iPhone-and-208-followers.html
	var fInfluenceFactor = oUserProfile.followers_count/iAverageFollowersNumber;
	for (var i = 0; i < iTotalTweets; i++) {
		var oTweet = aTweets[i];
		var aWords = oTweet.text.split(' ');

		var iPositiveWords = 0;
		var iNegativeWords = 0;
		var iTotWords = aWords.length;
		var iRetweets = parseInt(oTweet.retweet_count);
		iTotalRetweets += iRetweets;
		for (var j = 0; j < iTotWords; j++) {//TODO what todo with hashtags?
			if (chtsentanalysis.isPositive(aWords[j].toLowerCase())) {
				iPositiveWords++;
			} else if (chtsentanalysis.isNegative(aWords[j].toLowerCase())) {
				iNegativeWords++;
			}
		}
		if (iPositiveWords > iNegativeWords)
			iPositiveTweets += iRetweets+1; //each tweet should count at least 1, even if it has 0 retweets
		else if (iPositiveWords < iNegativeWords)
			iNegativeTweets += iRetweets+1;
	}
	var iNeutralTweets = iTotalRetweets - (iPositiveTweets + iPositiveTweets);
	//score is computed as: %_of_positive_tweets + %_of_neutral_tweets/2 - %_of_negative_tweets + 100
	//* neutral tweets are considered as having a positive impact on the score
	//* +101 is to make sure the score is always positive (e.g.: minimum score = 1 for a user with negative tweets only)
	var iScore = iPositiveTweets/iTotalRetweets*100 + (iNeutralTweets/iTotalRetweets*100)/2 - iNegativeTweets/iTotalRetweets*100 + 101;
	//we adjust the score using an influence factor, that is the ratio between the number of followers the current user has
	//and the average number of followers per twitter user.
	//this rewards users with many positive tweets and penalizes users wtih many negative reviews
	if (iPositiveTweets > iNegativeTweets)
		iScore = iScore*fInfluenceFactor;
	else
		iScore = iScore/fInfluenceFactor;
	return iScore;
};

function _getProfile (sTwitterHandle, fnCallBack) {
	chtwitter.query(
		config.twitter.TWITTER_CUSTOMER_KEY,
		config.twitter.TWITTER_CUSTOMER_SECRET,
		"/1.1/users/show.json",
		{
			screen_name: sTwitterHandle
		},
		fnCallBack
	);
};

/* GET api listing. */
router.get('/profile/:twitterhandle', function(oHttpRequest, oHttpResponse, fnNext) {
	oHttpResponse.setHeader('Content-Type', 'application/json');
	_getProfile(
		oHttpRequest.params.twitterhandle,
		function (sErr, oData) {
			oHttpResponse.send(JSON.stringify(oData));
		}
	);
});

router.get('/timeline/:twitterhandle', function (oHttpRequest, oHttpResponse, fnNext) {
	oHttpResponse.setHeader('Content-Type', 'application/json');

	var bWithPicturesOnly = oHttpRequest.query.with_pictures_only == "true";
	var iMinRetweets = parseInt(oHttpRequest.query.min_retweets) || 0;

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

router.get('/reputation_score/:twitterhandle', function(oHttpRequest, oHttpResponse, fnNext) {
	oHttpResponse.setHeader('Content-Type', 'application/json');

	chtwitter.getTimeline(
		config.twitter.TWITTER_CUSTOMER_KEY,
		config.twitter.TWITTER_CUSTOMER_SECRET,
		oHttpRequest.params.twitterhandle,
		0,
		0,
		0,
		function (sErr, oData) {
			if (sErr) 
				oHttpResponse.send(sErr);
			else {
				var iReputationScore = -1;
				if (oData.length > 0) {
					var oUserProfile = oData[0].user;
					iReputationScore = _computeReputationScore(oUserProfile, oData);
				}
				oHttpResponse.send(
					JSON.stringify({
						reputation_score: iReputationScore
					})
				);
			}
		}
	);
});

module.exports = router;
