var util = require("util");
var sst = require("sst");
var namedRegexp = require('named-regexp').named;

module.exports = InterjectionSM = function(){
	if (!(this instanceof InterjectionSM))
		return new InterjectionSM();
	
	sst.call(this);
};
util.inherits(InterjectionSM,sst);

InterjectionSM.prototype.states = {
	"start" : {
		"next" : ["word"]
	},
	"word-a" : {
		// {{la-interj}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-interj\}\}\s+/),
		"defaults" : { type : "word", pos : "interjection" },
		"next" : ["definition","word"]
	},
	"word-b" : {
		// {{head|la|interjection|head=nē}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|interjection\|head=[^}]+\}\}\s+/),
		"defaults" : { type : "word", pos : "interjection" },
		"next" : ["definition","word"]
	},
	"word-c" : {
		// {{la-interj|vetō}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-interj\|[^|}]+\}\}\s+/),
		"defaults" : { type : "word", pos : "interjection" },
		"next" : ["definition","word"]
	},
	"word-d" : {
		// '''fī'''!
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''[^']+'''!?\s+/),
		"defaults" : { type : "word", pos : "interjection" },
		"next" : ["definition","word"]
	},
	"word-e" : {
		// {{head|la|interjection}}
		// {{head|la|interjection|head=nē}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|interjection\}\}\s+/),
		"defaults" : { type : "word", pos : "interjection" },
		"next" : ["definition","word"]
	},
	"definition" : {
		// definition
		"test" : namedRegexp(/^#[^\n]+\s*/),
		"next" : ["definition","word"],
		"preprocess" : require("./definition")
	}
};

InterjectionSM.prototype.startState = "start";