var util = require("util");
var sst = require("sst");
var namedRegexp = require('named-regexp').named;

module.exports = ConjunctionSM = function(){
	if (!(this instanceof ConjunctionSM))
		return new ConjunctionSM();
	
	sst.call(this);
};
util.inherits(ConjunctionSM,sst);

ConjunctionSM.prototype.states = {
	"start" : {
		"next" : ["word"]
	},
	"word-a" : {
		// '''at'''\n\n# [[but]], [[yet]]
		"type" : "word",
		"test" : namedRegexp(/^'''(:<word>[^' \n]+)'''[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "conjunction", word : "" },
		"next" : ["definition","word"]
	},
	"word-b" : {
		// {{head|la|conjunction|interrogative|}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|conjunction\|(:<pattern>[^|]+)\|\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "conjunction", pattern : "" },
		"next" : ["definition","word"]
	},
	"word-c" : {
		// {{head|la|conjunction}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|conjunction(?:\|[^}]*)?\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "conjunction" },
		"next" : ["definition","word"]
	},
	"word-d" : {
		// ''First word or word phrase in sentence + '' '''enim'''  {{qualifier|postpositive}}
		"type" : "word",
		"test" : namedRegexp(/''(:<info>First word or word phrase in sentence) \+ '' '''([^']+)'''[^\n]+\{\{qualifier\|(:<qualifier>[^|}]+)\}\}[ \t]*\n\s+/),
		"defaults" : { "type" : "word", pos : "conjunction", qualifier : "" },
		"defaults" : { type : "word", pos : "conjunction" },
		"next" : ["definition","word"]
	},
	"word-e" : {
		// '''dummodo''' ''+ subjunctive''
		"type" : "word",
		"test" : namedRegexp(/^'''(:<word>[^' \n]+)''' ''\+ subjunctive''[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "conjunction", word : "", "with" : "subjunctives" },
		"next" : ["definition","word"]
	},
	"word-f" : {
		// {{head|la|conjunction}} (''first word of sentence'' + '''igitur''')  {{qualifier|postpositive}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|conjunction\}\} \(''(:<info>first word of sentence)'' \+ '''([^']+)'''\)[^\n]+\{\{qualifier\|(:<qualifier>[^|}]+)\}\}[ \t]*\n\s+/),
		"defaults" : { "type" : "word", pos : "conjunction", qualifier : "" },
		"defaults" : { type : "word", pos : "conjunction" },
		"next" : ["definition","word"]
	},
	"definition" : {
		// definition
		"test" : namedRegexp(/^#[^\n]+\s*/),
		"next" : ["definition","word"],
		"preprocess" : require("./definition")
	}
};

ConjunctionSM.prototype.startState = "start";