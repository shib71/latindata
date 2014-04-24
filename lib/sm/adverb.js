var util = require("util");
var sst = require("sst");
var namedRegexp = require('named-regexp').named;

module.exports = AdverbSM = function(){
	if (!(this instanceof AdverbSM))
		return new AdverbSM();
	
	sst.call(this);
};
util.inherits(AdverbSM,sst);

AdverbSM.prototype.destem = function(info){
	this.processDefaults(info);
	
	info.results.comparative = info.results.stem + "ius";
	info.results.superlative = info.results.stem + "issime";
}

AdverbSM.prototype.states = {
	"start" : {
		"next" : ["word","inflections"]
	},
	"word-b" : {
		// {{la-adv|pius|pius|magis pius|piisimus|piisimus}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-adv\|[^|}\n]+\|(:<comparative>[^|}\n]+)\|(:<comparative_>[^|}\n]+)\|(:<superlative>[^|}\n]+)\|(:<superlative_>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "comparative" : "", "superlative" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-c" : {
		// {{la-adv|lent||e}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-adv\|(:<stem>[^|}\n]+)\|(:<stem_>[^|}\n]*)\|(:<ending>(?:e|ē|ie|iē|er|ter|iter|im|-))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "stem" : "", "ending" : "" },
		"preprocess" : AdverbSM.prototype.destem,
		"next" : ["inflection","definition","word"]
	},
	"word-d" : {
		// {{head|la|adverb}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|adverb\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb" },
		"next" : ["inflection","definition","word"]
	},
	"word-e" : {
		// {{head|la|adverb|head=nī}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|adverb\|head=[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb" },
		"next" : ["inflection","definition","word"]
	},
	"word-f" : {
		// '''nove'''
		"type" : "word",
		"test" : namedRegexp(/(^|\n)'''(:<word_>[^'\n]+)'''[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb" },
		"next" : ["inflection","definition","word"]
	},
	"word-g" : {
		// {{la-adv||ibī|-}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-adv\|\|(:<stem>[^|}\n]+)\|(:<ending>(?:e|ē|ie|iē|er|ter|iter|im|-))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "stem" : "", "ending" : "" },
		"preprocess" : AdverbSM.prototype.destem,
		"next" : ["inflection","definition","word"]
	},
	"word-h" : {
		// {{la-adv|bene|melius||optime|optimē}}
		"type" : "word",
 		"test" : namedRegexp(/\{\{la-adv\|(:<word_>[^|}\n]+)\|(:<comparative>[^|}\n]+)\|\|(:<superlative>[^|}\n]+)\|(:<superlative_>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "comparative" : "", "superlative" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-i" : {
		// {{la-adv|ēlātē|elatius|ēlātius|-}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-adv\|(:<word_>[^|}\n]+)\|(:<comparative>[^|}\n]+)\|(:<comparative_>[^|}\n]+)\|(:<ending>(?:e|ē|ie|iē|er|ter|iter|im|o|ō|-))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "comparative" : "", "superlative" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-j" : {
		// {{head|la|adverb|head=nūper}} (''Superlative'': [[nuperrime]])
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|adverb\|head=[^|}\n]+\}\} \(''Superlative'': (?:\[\[)?(:<superlative>[^\]'\)\n]+)(?:\]\])?\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "superlative" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-k" : {
		// {{la-adv|cit||o}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-adv\|(:<stem>[^|}\n]+)\|(:<stem_>[^|}\n]*)\|(:<ending>(?:e|ē|ie|iē|er|ter|iter|im|o|ō|-))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "stem" : "", "ending" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-l" : {
		// '''quidem'''  {{qualifier|postpositive}}
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''[^'\n]+'''[ \t]+\{\{qualifier\|(:<qualifier>(?:postpositive))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "qualifier" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-m" : {
		// {{la-adv|pacat|pācāt|ē}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-adv\|(:<stem>[^|}\n]+)\|(:<stem_>[^|}\n]+)\|(:<ending>(?:e|ē|ie|iē|er|ter|iter|im|o|ō|-))\}\}/),
		"defaults" : { "type" : "word", "pos" : "adverb", "stem" : "", "ending" : "" },
		"preprocess" : AdverbSM.prototype.destem,
		"next" : ["inflection","definition","word"]
	},
	"word-n" : {
		// {{head|la}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb" },
		"next" : ["inflection","definition","word"]
	},
	"word-o" : {
		// {{head|la|adverb|comparative|minus|superlative|minime}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|adverb\|comparative\|(:<comparative>[^|}\n]+)\|superlative\|(:<superlative>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "comparative" : "", "superlative" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-p" : {
		// {{la-adv|prope|propius||proximus}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-adv\|(:<word_>[^|}\n]+)\|(:<comparative>[^|}\n]+)\|\|(:<superlative>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "adverb", "comparative" : "", "superlative" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-q" : {
		// '''[[quid#Latin|quid]][[ni#Latin|ni]]'''?
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''\[\[(:<derivedfrom>[^|}\n#]+)(?:#[^|}\n]+)?\|[^|}\n]+\]\]\[\[(:<derivedfrom2>[^|}\n#]+)(?:#[^|}\n]+)?\|[^|}\n]+\]\]'''\?[ \t]*(\n\s*|$)/),
		"default" : { "type" : "word", "pos" : "adverb" },
		"next" : ["inflection","definition","word"]
	},
	"inflections-a" : {
		// {{head|la|adverb|superlative}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|adverb\|(?:superlative)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflection-a" : {
		// # {{superlative of|belle|POS=adverb|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{(:<form>(?:sup))(?:erlative) of\|(:<inflectionof>[^|}\n]+)\|POS=adverb\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "adverb", "inflectionof" : "", "form" : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-b" : {
		// # {{superlative of|prope|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{(:<form>(?:sup))(?:erlative) of\|(:<inflectionof>[^|}\n]+)\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "adverb", "inflectionof" : "", "form" : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"definition" : {
		// definition
		"test" : namedRegexp(/^#[^\n]+\s*/),
		"next" : ["definition","word"],
		"preprocess" : require("./definition")
	}
};

AdverbSM.prototype.startState = "start";