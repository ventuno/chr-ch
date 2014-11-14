var https = require('https');
var base64 = require('base-64');
var querystring = require('querystring');

function _getBearerToken (sHost, sPath, sConsumerKey, sConsumerSecret, fnCallBack) {
    var sEncodedConsumerKey = encodeURI(sConsumerKey);
    var sEncodedConsumerSecret = encodeURI(sConsumerSecret);
    var sBearerTokenCredentials = sEncodedConsumerKey + ":" + sEncodedConsumerSecret;
    var sBase64EncodedBearerTokenCredentials = base64.encode(sBearerTokenCredentials);

    var oPostOptions = {
        host: sHost,
        path: sPath,
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + sBase64EncodedBearerTokenCredentials,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };

    var oPostRequest = https.request(oPostOptions, function(oHttpResponse) {
        oHttpResponse.setEncoding('utf8');
        var sData = "";
        oHttpResponse.on('data', function (sDataChunk) {
            sData += sDataChunk;
        });

        oHttpResponse.on('end', function () {
            fnCallBack(null, JSON.parse(sData))
        });
    });

    var oPostData = querystring.stringify({
          'grant_type' : 'client_credentials',
    });
    oPostRequest.end(oPostData);
};

var TWITTER_API_HOST = 'api.twitter.com';
var TWITTER_API_AUTH_PATH = '/oauth2/token';

module.exports = {
    getBearerToken: function (sConsumerKey, sConsumerSecret, fnCallBack) {
        _getBearerToken(TWITTER_API_HOST, TWITTER_API_AUTH_PATH, sConsumerKey, sConsumerSecret, fnCallBack);
    }
};