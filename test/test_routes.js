var should = require('should');
var assert = require('assert');
var request = require('supertest');
var url = require('url');
var config = require('../config');

var TWITTER_API_BASE_URL = config.twitter.API_BASE_URL;
	var sUrl = 'http://localhost:3000';

	describe('Profile', function() {
		it('Retrieve user PROFILE succesfully', function(fnDone) {
			var sTwitterHandle = "ventuno_";
			request(sUrl)
			.get(TWITTER_API_BASE_URL + '/profile/' + sTwitterHandle)
			.expect(200)
			.end(function(oErr, oHttpResponse) {
				if (oErr) {
					throw oErr;
				}
				oHttpResponse.body.should.have.property('id');
				oHttpResponse.body.id.should.equal(76294873);
				fnDone();
			});
		});
	});

	describe('Timeline', function() {
		it('Retrieve user TIMELINE succesfully', function(fnDone) {
			var sTwitterHandle = "justinbieber";
			var sQueryParams = url.format({
                query: {
                	count: 15
                }
            });
            var sPath = TWITTER_API_BASE_URL + '/timeline/' + sTwitterHandle + sQueryParams;
			request(sUrl)
			.get(sPath)
			.expect(200)
			.end(function(oErr, oHttpResponse) {
				if (oErr) {
					throw oErr;
				}
				oHttpResponse.body.should.have.property('length');
				oHttpResponse.body.length.should.equal(15);
				fnDone();
			});
		});
	});