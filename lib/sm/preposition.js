var util = require("util");
var sst = require("sst");
var namedRegexp = require('named-regexp').named;

module.exports = PrepositionSM = function(){
	if (!(this instanceof PrepositionSM))
		return new PrepositionSM();
	
	sst.call(this);
};
util.inherits(PrepositionSM,sst);

PrepositionSM.prototype.processCase = function(info){
	this.processDefaults(info);
	
	info.results["with"] = info.matches.capture("case");
}

PrepositionSM.prototype.states = {
	"start" : {
		"next" : ["word"]
	},
	"word-a" : {
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|preposition(?:\|head=[^}]+)?\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "preposition" },
		"next" : ["definition"]
	},
	"word-b" : {
		// '''trāns''' + ''accusative''
		// '''circa''' + accusative case
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''[^']+''' \+ (?:'')?(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive)(?:'')?(?: case)?\s+/),
		"preprocess" : PrepositionSM.prototype.processCase,
		"defaults" : { type : "word", pos : "preposition" },
		"next" : ["definition"]
	},
	"word-c" : {
		// {{head|la|preposition|with accusative}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|preposition\|(?:with|takes|\+) (:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive)\}\}\s+/),
		"preprocess" : PrepositionSM.prototype.processCase,
		"defaults" : { type : "word", pos : "preposition" },
		"next" : ["definition"]
	},
	"word-d" : {
		// '''aput'''
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''[^']+'''\s+/),
		"defaults" : { type : "word", pos : "preposition" },
		"next" : ["definition"]
	},
	"word-e" : {
		// {{head|la|preposition|head=prō}} + ''[[ablative]]''
		// {{head|la|preposition|head=intrā}} with ''[[accusative]]''
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)\{\{head\|la\|preposition\|head=[^|}]+\}\} (?:\+|with) (?:'')?(?:\[\[)?(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive)(?:\]\])?(?:'')?(?: case)?\s+/),
		"preprocess" : PrepositionSM.prototype.processCase,
		"defaults" : { type : "word", pos : "preposition" },
		"next" : ["definition"]
	},
	"word-f" : {
		// {{head|la|preposition}} + ''accusative''
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)\{\{head\|la\|preposition\}\} \+ (?:'')?(?:\[\[)?(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive)(?:\]\])?(?:'')?(?: case)?\s+/),
		"preprocess" : PrepositionSM.prototype.processCase,
		"defaults" : { type : "word", pos : "preposition" },
		"next" : ["definition"]
	},
	"definition" : {
		// definition
		"test" : namedRegexp(/^#[^\n]+\s*/),
		"next" : ["definition","word"],
		"preprocess" : require("./definition")
	}
};

PrepositionSM.prototype.startState = "start";