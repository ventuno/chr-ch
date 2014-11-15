var express = require('express');
var router = express.Router();

var chtwitter = require('../local_modules/ch-twitter');
var config = require('../config');

/* GET api listing. */
router.get('/', function(req, res) {
	chtwitter.query(config.TWITTER_CUSTOMER_KEY, config.TWITTER_CUSTOMER_SECRET, "/1.1/statuses/user_timeline.json", {count:100, screen_name:"enr1Co"}, function (sErr, oData) {
		res.send(JSON.stringify(oData));
	});
});

module.exports = router;
