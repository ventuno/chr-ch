var express = require('express');
var router = express.Router();

var chtwitter = require('../local_modules/ch-twitter');
var config = require('../config');

/* GET api listing. */
router.get('/', function(req, res) {
	chtwitter.getBearerToken(config.TWITTER_CUSTOMER_KEY, config.TWITTER_CUSTOMER_SECRET, function (sErr, oData) {
		res.send(JSON.stringify(oData));
	});
});

module.exports = router;
