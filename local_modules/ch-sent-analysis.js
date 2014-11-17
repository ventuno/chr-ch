var fs = require('fs');
var path = require('path');

var SENT_ANALYSIS_DIR = path.join(__dirname, 'data/ch-sent-analysis');
var SENT_ANALYSIS_POSITIVE_WORDS = path.join(SENT_ANALYSIS_DIR, '/positive-words.txt');
var SENT_ANALYSIS_NEGATIVE_WORDS = path.join(SENT_ANALYSIS_DIR, '/negative-words.txt');

function _readFile (sFile, fnCallBack) {
	var sFileData = fs.readFileSync(sFile, 'utf8');
	var oWords = {};
	var aLines = sFileData.split('\n');
	for (var i = 0; i < aLines.length; i++) {
		if (aLines[i].indexOf(';') == -1) //lines with ; are comments in these files
			oWords[aLines[i]] = 1;
	}
	return oWords;
}

function _isInDictionary (oDictionary, sWord) {
	return oDictionary.hasOwnProperty(sWord); //oDictionary[sWord] == 1 should be the same
}

module.exports = {
	negativeWords: _readFile(SENT_ANALYSIS_NEGATIVE_WORDS),
	positiveWords: _readFile(SENT_ANALYSIS_POSITIVE_WORDS),
	isPositive: function (sWord) {
		return _isInDictionary(this.positiveWords, sWord);
	},
	isNegative: function (sWord) {
		return _isInDictionary(this.negativeWords, sWord);
	}
};