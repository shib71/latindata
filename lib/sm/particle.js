var util = require("util");
var sst = require("sst");
var namedRegexp = require('named-regexp').named;

module.exports = ParticleSM = function(){
	if (!(this instanceof ParticleSM))
		return new ParticleSM();
	
	sst.call(this);
};
util.inherits(ParticleSM,sst);

ParticleSM.prototype.states = {
	"start" : {
		"next" : ["word"]
	},
	"word" : {
		// {{head|la|particle|head=nōn|negative particle}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|particle\|head=(:<word>[^|]+)[^}]+\}\}\s+/),
		"defaults" : { type : "word", pos : "particle", word : "" },
		"next" : ["definition","word"]
	},
	"definition" : {
		// definition
		"test" : namedRegexp(/^#[^\n]+\s*/),
		"next" : ["definition","word"],
		"preprocess" : require("./definition")
	}
};

ParticleSM.prototype.startState = "start";