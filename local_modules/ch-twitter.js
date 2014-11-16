var https = require('https');
var base64 = require('base-64');
var querystring = require('querystring');
var url = require('url');
var events = require('events');

var _oBearerToken = null;
//in order to avoid weird (infinite) looping when getting the bearer token
//we set this to true if we've sent a request to _getBearerToken
var _bTokenRefreshed = false;
function _invalidateBearerToken () {
    console.log("Invalidating Bearer token", JSON.stringify(_oBearerToken));
    _oBearerToken = null;
};

function _getBearerToken (sHost, sPath, sConsumerKey, sConsumerSecret, fnCallBack) {
    if (_oBearerToken) {
        console.log("Already got Bearer token", JSON.stringify(_oBearerToken));
        return fnCallBack(null, _oBearerToken);
    }
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
            //TODO need to check if we're getting a valid token...
            if (oHttpResponse.statusCode === 403) {
                return fnCallBack(JSON.parse(sData)); //fail
            }
            _oBearerToken = JSON.parse(sData);
            console.log("Got Bearer token", JSON.stringify(_oBearerToken));
            _bTokenRefreshed = false;
            fnCallBack(null, _oBearerToken);
        });
    }).on('error', function(sError) {
        fnCallBack(sError); //fail
    });

    var oPostData = querystring.stringify({
          'grant_type' : 'client_credentials',
    });
    oPostRequest.end(oPostData);
};

function _query (sConsumerKey, sConsumerSecret, sPath, oQueryParams, fnCallBack) {
    _getBearerToken(TWITTER_API_HOST, TWITTER_API_OAUTH2_PATH, sConsumerKey, sConsumerSecret, function (oError, oBearerToken) {
        if (!oError) {
            if (oQueryParams) {
                var sQueryParams = url.format({
                    query: oQueryParams
                });
                sPath += sQueryParams;
            }
            console.log("Requesting:", sPath);
            var oGetOptions = {
                host: TWITTER_API_HOST,
                path: sPath,
                headers: {
                    'Authorization': 'Bearer ' + oBearerToken.access_token
                },
            };
            https.get(oGetOptions, function(oHttpResponse) {
                oHttpResponse.setEncoding('utf8');
                var sData = "";
                oHttpResponse.on('data', function (sDataChunk) {
                    sData += sDataChunk;
                });
                oHttpResponse.on('end', function () {
                    console.log("Query data received", /*sData,*/ oHttpResponse.statusCode);
                    if (oHttpResponse.statusCode === 200) {
                        console.log("Query data **SUCCESFUL**"/*, sData,*/);
                        var oData = JSON.parse(sData);
                        fnCallBack(null, oData);    
                    } else {
                        console.log("Query data **FAILED**", sData);
                        if (oHttpResponse.statusCode === 401) {
                            if (!_bTokenRefreshed) {
                                console.log("Request unauthorized with Bearer token", JSON.stringify(_oBearerToken), JSON.stringify(oData));
                                _bTokenRefreshed = true;
                                _invalidateBearerToken();
                                return _query (sConsumerKey, sConsumerSecret, sPath, oQueryParams, fnCallBack);
                            }
                        }
                        return fnCallBack(sData); //fail
                    }
                });
            }).on('error', function(sError) {
                fnCallBack(sError);
            });
        } else {
            console.log("Getting Bearer token failed with error", JSON.stringify(oError), "and keys", sConsumerKey, sConsumerSecret);
            fnCallBack(oError); //fail
        }
    });
};

function _getTimeline (sConsumerKey, sConsumerSecret, sScreenName, iCount, iMaxId, fnCallBack, fnInternalCallBack, oTimelineEventEmitter) {
    function fnInternalCallBack (sErr, oData) {
        if (!sErr) {
            if (iCount > oData.length) {
                var iLeft = iCount - oData.length;
                var iMaxId = oData[oData.length-1].id;
                console.log("Requesting additional timeline tweets", iCount, oData.length, iMaxId);
                oTimelineEventEmitter.emit('timelineData', oData);
                return _getTimeline(sConsumerKey, sConsumerSecret, sScreenName, iLeft, iMaxId, null, fnInternalCallBack, oTimelineEventEmitter);
            }
            //fnCallBack(null, oData);
            console.log("?>>>>>>>>>>>>>>>>>>>>>No more");
            return oTimelineEventEmitter.emit('timelineEnd', oData);
        } else {
            //fnCallBack(sErr); //fail
            return oTimelineEventEmitter.emit('timelineError', sErr);
        }
    };

    var oParams = {
        count: iCount,
        screen_name: sScreenName,
    };
    if (iMaxId)
        oParams.max_id = iMaxId;

    console.log("Requesting TIMELINE", iCount);
    _query(sConsumerKey, sConsumerSecret, TWITTER_API_TIMELINE_URL, oParams, fnInternalCallBack);

    if (!oTimelineEventEmitter)
        oTimelineEventEmitter = new events.EventEmitter();
    if (fnCallBack)
        fnCallBack(null, oTimelineEventEmitter);
};

var TWITTER_API_HOST = 'api.twitter.com';
var TWITTER_API_OAUTH2_PATH = '/oauth2/token';
var TWITTER_API_BASE_URL = '/1.1';
var TWITTER_API_TIMELINE_URL = TWITTER_API_BASE_URL + '/statuses/user_timeline.json';

module.exports = {
    getBearerToken: function (sConsumerKey, sConsumerSecret, fnCallBack) {
        _getBearerToken(TWITTER_API_HOST, TWITTER_API_OAUTH2_PATH, sConsumerKey, sConsumerSecret, fnCallBack);
    },
    query: function (sConsumerKey, sConsumerSecret, sPath, oQueryParams, fnCallBack) {
        _query(sConsumerKey, sConsumerSecret, sPath, oQueryParams, fnCallBack);
    },
    getTimeline: function (sConsumerKey, sConsumerSecret, sScreenName, iCount, fnCallBack) {
        var oTotalData = [];
        _getTimeline(sConsumerKey, sConsumerSecret, sScreenName, iCount, null, function (sErr, oTimelineEventEmitter) {
            oTimelineEventEmitter.on('timelineData', function (oData) {
                oTotalData = oTotalData.concat(oData);
            });
            oTimelineEventEmitter.on('timelineEnd', function (oData) {
                oTotalData = oTotalData.concat(oData);
                fnCallBack(null, oTotalData);
            });
            oTimelineEventEmitter.on('timelineError', function (sErr) {
                fnCallBack(sErr); //fail
            });
        });
    }
};