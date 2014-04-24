var util = require("util");
var sst = require("sst");
var namedRegexp = require('named-regexp').named;
var processDefinition = require("./definition");

module.exports = PronounSM = function(){
	if (!(this instanceof PronounSM))
		return new PronounSM();
	
	sst.call(this);
};
util.inherits(PronounSM,sst);

PronounSM.prototype.processGenders = function(info){
	var g1 = info.matches.captures.gender1 ? info.matches.capture("gender1").toLowerCase() : "m";
	var g2 = info.matches.captures.gender2 ? info.matches.capture("gender2").toLowerCase() : "f";
	var g3 = info.matches.captures.gender3 ? info.matches.capture("gender3").toLowerCase() : "n";
	
	if (g1 === "c") g1 = "m";
	if (g2 === "c") g2 = "f";
	
	info.results = [{ 
		"type" : "word", 
		"pos" : "pronoun" 
	},{ 
		"type" : "inflection", 
		"pos" : "pronoun", 
		"word" : this.meta.word, 
		"inflectionof" : this.meta.word, 
		"case" : "nom", 
		"gender" : g1
	},{ 
		"type" : "inflection", 
		"pos" : "pronoun", 
		"word" : info.matches.capture("word2"), 
		"inflectionof" : this.meta.word,
		"case" : "nom", 
		"gender" : g2
	},{ 
		"type" : "inflection", 
		"pos" : "pronoun", 
		"word" : info.matches.capture("word3"), 
		"inflectionof" : this.meta.word,
		"case" : "nom", 
		"gender" : g3
	}];
}

PronounSM.prototype.processCombinedDefInf = function(info){
	this.processDefaults(info);
	processDefinition.call(this,info);
}

PronounSM.prototype.states = {
	"start" : {
		"next" : ["word","inflections"]
	},
	"word-a" : {
		// {{head|la|pronoun|head=mē|personal pronoun}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|head=[^|]+\|personal pronoun\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "pronoun", pattern : "personal" },
		"next" : ["inflection","definition","word"]
	},
	"word-b" : {
		// {{head|la|pronoun|head=sē}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|head=[^}|]+\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "pronoun" },
		"next" : ["inflection","definition","word"]
	},
	"word-c" : {
		// {{head|la|pronoun|head=nēmō|g=m|g2=f}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|head=[^|]+\|g=(:<gender>(?:m|f|n))\|g2=(:<gender2>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "pronoun", gender : "", gender2 : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-d" : {
		// '''nihil''' {{n}}
		"type" : "word",
		"test" : namedRegexp(/(^|\n)'''(?:nihil)''' \{\{(:<gender>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "pronoun", gender : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-e" : {
		// {{head|la|pronoun|head=tū|second person singular||possessive adjective|tuus}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|head=[^}|]+(\|[^|}]*){4}\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "pronoun" },
		"next" : ["inflection","definition","word"]
	},
	"word-f" : {
		// {{head|la|demonstrative pronoun|demonstrative|g=m}}, [[haec]] {{f}}, [[hoc]] {{n}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|demonstrative pronoun\|demonstrative\|g=(:<gender1>(?:m|f|n))\}\}, \[\[(:<word2>[^\]]+)\]\] \{\{(:<gender2>(?:m|f|n))\}\}, \[\[(:<word3>[^\]]+)\]\] \{\{(:<gender3>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-g" : {
		// {{head|la|pronoun|first person||nominative||plural|nos|head=ego / egō}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|(:<person>(?:first|second|third)) person\|\|(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|ative|usative|ive)\|\|[^|]+\|[^|]+\|head=[^|}]+\}\}[ \t]*(\n\s*|$)/),
		"preprocess" : function(info){
			info.results = [
				{ type : "word", pos : "pronoun" },
				{ type : "inflection", pos : "pronoun", person : info.matches.capture("person"), case : info.matches.capture("case"), quantity : "s", inflectionof : info.meta.word }
			];
		},
		"next" : ["inflection","definition","word"]
	},
	"word-i" : {
		// {{head|la|pronoun|g=m|feminine|quae|neuter|quid}})
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|g=(:<gender1>(?:m|f|n))\|(:<gender2>(?:m|f|n))(?:asculine|eminine|euter)\|(:<word2>[^|}]+)\|(:<gender3>(?:m|f|n))(?:asculine|eminine|euter)\|(:<word3>[^|}]+)\}\}[^\n]*\n\s+/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-j" : {
		// {{head|la|pronoun|head=quī|g=m|feminine|quae|neuter|quod}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|head=(:<word1>[^|]+)\|g=(:<gender1>(?:m|f|n))\|(:<gender2>(?:m|f|n))(?:asculine|eminine|euter)\|(:<word2>[^|]+)\|(:<gender3>(?:m|f|n))(?:asculine|eminine|euter)\|(:<word3>[^|}]+)\}\}[^\n]*\n\s+/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-k" : {
		// '''quīdam''' ''m'', '''quaedam''' ''f'', '''quiddam''' ''n''
		"type" : "word",
		"test" : namedRegexp(/'''(:<word1>[^']+)''' ''(:<gender1>(?:m|f|n))'', '''(:<word2>[^']+)''' ''(:<gender2>(?:m|f|n))'', '''(:<word3>[^']+)''' ''(:<gender3>(?:m|f|n))''[ \t]*(\n\s*|$)/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-l" : {
		// {{la-adj-1&2|tuus|tua#Latin|tua|tuum#Latin|tuum}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-adj-1&2\|(:<word1>[^|]+)\|(:<word2>[^|#}]+)(?:#[^|}]+)?\|[^|}]+\|(:<word3>[^|#}]+)(?:#[^|}]+)?\|[^|}]+\}\}[ \t]*\n\s+/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-m" : {
		// '''quisque''' {{m}}, {{f}}, '''[[quidque]]''' {{n}} {{qualifier|indefinite}}
		"type" : "word",
		"test" : namedRegexp(/'''(:<word1>(:<word2>[^']+))''' \{\{(:<gender1>(?:m|f|n))\}\}, \{\{(:<gender2>(?:m|f|n))\}\}, '''(?:\[\[)?(:<word3>[^'\]]+)(?:\]\])?''' \{\{(:<gender3>(?:m|f|n))\}\}[^\n]+\s+/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-n" : {
		// '''quisquis''' {{m|f}}, '''[[quidquid]]''' {{n}} {{qualifier|indefinite}}
		"type" : "word",
		"test" : namedRegexp(/'''(:<word1>(:<word2>[^']+))''' \{\{(:<gender1>(?:m|f|n))\|(:<gender2>(?:m|f|n))\}\}, '''(?:\[\[)?(:<word3>[^'\]]+)(?:\]\])?''' \{\{(:<gender3>(?:m|f|n))\}\}[^\n]+\s+/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-o" : {
		// '''aliquis''' {{c}}, '''[[aliquid]]''' {{n}}; ''irregular [[declension]]''
		"type" : "word",
		"test" : namedRegexp(/'''(:<word1>(:<word2>[^']+))''' \{\{(:<gender1>(:<gender2>c))\}\}, '''(?:\[\[)?(:<word3>[^'\]]+)(?:\]\])?''' \{\{(:<gender3>(?:m|f|n))\}\}[^\n]+\s+/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-p" : {
		// {{la-adj-1&2|vester|vester|vestra|vestra|vestrum|vestrum}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-adj-1&2\|(:<word1>[^|]+)\|(?:[^|}]+)\|(:<word2>[^|#}]+)\|[^|}]+\|(:<word3>[^|#}]+)\|[^|}]+\}\}[ \t]*\n\s+/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-q" : {
		// '''ecquis''' {{m|f}}, [[ecquid]] {{n}} {{qualifier|[[interrogative pronoun]]}}
		"type" : "word",
		"test" : namedRegexp(/'''(:<word1>(:<word2>[^']+))''' \{\{(:<gender1>(?:m|f|n))\|(:<gender2>(?:m|f|n))\}\}, (?:\[\[)?(:<word3>[^'\]]+)(?:\]\])? \{\{(:<gender3>(?:m|f|n))\}\} \{\{qualifier\|\[\[(:<qualifier>[^\]\n]+)\]\]\}\}[ \t]*(\n\s*|$)/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-r" : {
		// '''illic''' ([[illaec]], [[illuc]])
		"type" : "word",
		"test" : namedRegexp(/'''(:<word1>[^']+)''' \(\[\[(:<word2>[^\]\n]+)\]\], \[\[(:<word3>[^\]\n]+)\]\]\)[ \t]*(\n\s*|$)/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-s" : {
		// {{head|la|pronoun}} (feminine '''[[ipsa]]''', neuter '''[[ipsum]]''')
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\}\} \((:<gender2>(?:m|f|n))(?:asculine|eminine|euter) '''\[\[(:<word2>[^'\]]+)\]\]''', (:<gender3>(?:m|f|n))(?:asculine|eminine|euter) '''\[\[(:<word3>[^\]\n]+)\]\]'''\)[ \t]*(\n\s*|$)/),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-t" : {
		// '''uterque''' {{m}} (Feminine: [[utraque]], Neuter: [[utrumque]], Plural: [[utrique]])
		"type" : "word",
		"test" : namedRegexp(/'''(:<word1>[^']+)''' \{\{(?:m|f|n)\}\} \((:<gender2>(?:m|f|n))(?:asculine|eminine|euter): \[\[(:<word2>[^'\]]+)\]\], (:<gender3>(?:m|f|n))(?:asculine|eminine|euter): \[\[(:<word3>[^\]\n]+)\]\][^\n]*(\n\s*|$)/i),
		"preprocess" : PronounSM.prototype.processGenders,
		"next" : ["inflection","definition","word"]
	},
	"word-u" : {
		// {{head|la|pronoun|g=n|invariable}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|g=(:<gender>(?:m|f|n))\(:<qualifier>[^\|}]+\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "word", pos : "pronoun", gender : "" },
		"next" : ["inflection","definition","word"]
	},
	"inflections-a" : {
		// {{head|la|pronoun form}}\n\n
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|pronoun form\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-b" : {
		// '''hī'''\n\n
		"type" : "inflections",
		"test" : namedRegexp(/(?:^|\n)'''[^'\n]+'''[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-c" : {
		// {{head|la|pronoun}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-d" : {
		// {{la-adj-form|suīs}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-adj-form\|[^|}]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-e" : {
		// {{head|la|pronoun form|head=hās}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|pronoun form\|head=[^|}]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-f" : {
		// {{head|la|pronoun|g=n|interrogative pronoun}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|g=(:<gender>(?:m|f|n))\|interrogative pronoun\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-g" : {
		// {{la-pronoun-form|nōbīs}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-pronoun-form\|[^\}]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-h" : {
		// '''huic''' {{c}}
		"type" : "inflections",
		"test" : namedRegexp(/'''[^'\n]+''' \{\{c\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-i" : {
		// {{head|la}}
		"type" : "inflections",
		"test" : namedRegexp(/(?:^|\n)\{\{head\|la\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-j" : {
		// {{head|la|head=hōrum}}
		"type" : "inflections",
		"test" : namedRegexp(/(?:^|\n)\{\{head\|la\|head=[^|}]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-k" : {
		// {{head|la|pronoun|g=n|interrogative pronoun}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|pronoun\|g=(:<gender>(?:m|f|n))\|interrogative pronoun\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-l" : {
		// '''nihil''' {{n}}
		"type" : "inflections",
		"test" : namedRegexp(/(^|\n)'''[^'\n]+''' \{\{(:<gender>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflection-a" : {
		// # sometimes the dative of {{term|lang=la|ego}} instead of the more frequent {{term|lang=la|mihi}}\n\n
		"type" : "inflection",
		"test" : namedRegexp(/^# sometimes the dative of \{\{term\|lang=la\|ego\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "inflection", pos : "pronoun", inflectionof : "ego", "case" : "dat", quantity : "s" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-b" : {
		// # {{inflection of|hic||nom|m|p|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{(?:inflection of|inflected form of)\|(:<inflectionof>[^|]+)\|\|(:<case>nom|voc|acc|gen|dat|abl)\|(:<gender>m|f|n)\|(:<quantity>s|p)\|lang=la(?:\|nodot=1)?\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "inflection", pos : "pronoun", inflectionof : "", "case" : "", gender : "", quantity : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-c" : {
		// # {{form of|accusative plural|qui|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{form of\|(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) (:<quantity>(?:s|p))(?:ingular|lural)\|(:<inflectionof>[^|]+)\|lang=la(?:\|nodot=1)?\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "inflection", pos : "pronoun", inflectionof : "", "case" : "", quantity : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-d" : {
		// # {{form of|accusative masculine singular|lang=la|is}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{form of\|(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) (:<gender>(?:m|f|n))(?:asculine|eminine|euter) (:<quantity>(?:s|p))(?:ingular|lural)\|lang=la\|(:<inflectionof>[^|{]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { type : "inflection", pos : "pronoun", inflectionof : "", "case" : "", gender : "", quantity : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-e" : {
		// # for us, to us; dative plural of [[ego]]
		// # "of us"; genitive plural of [[ego]]
		"type" : "inflection",
		"test" : namedRegexp(/^# (?:(:<definition>[^\n]*);)?\s*(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) (:<quantity>(?:s|p))(?:ingular|lural) of \[\[(:<inflectionof>[^\]]+)\]\][ \t]*(\n\s*|$)/),
		"defaults" : { type : "inflection", pos : "pronoun", inflectionof : "", "case" : "", quantity : "" },
		"preprocess" : PronounSM.prototype.processCombinedDefInf,
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-f" : {
		// # "of ours"; genitive masculine/neuter singular & nominative masculine plural of [[noster]]
		"type" : "inflection",
		"test" : namedRegexp(/^# (?:(:<definition>[^\n]*);)?\s*genitive masculine\/neuter singular & nominative masculine plural of \[\[(:<inflectionof>[^\]]+)\]\][ \t]*(\n\s*|$)/),
		"defaults" : [
			{ type : "inflection", pos : "pronoun", inflectionof : "", "case" : "gen", gender : "m", quantity : "s" },
			{ type : "inflection", pos : "pronoun", inflectionof : "", "case" : "gen", gender : "n", quantity : "s" },
			{ type : "inflection", pos : "pronoun", inflectionof : "", "case" : "nom", gender : "m", quantity : "p" }
		],
		"preprocess" : PronounSM.prototype.processCombinedDefInf,
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-g" : {
		// # genitive feminine plural of [[qui#Latin|qui]]
		"type" : "inflection",
		"test" : namedRegexp(/^# (:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) (:<gender>(?:m|f|n))(?:asculine|eminine|euter) (:<quantity>(?:s|p))(?:ingular|lural) of \[\[(:<inflectionof>[^\]#]+)(?:#[^|\]]+)?(?:\|[^|\]]+)?\]\][ \t]*(\n\s*|$)/),
		"defaults" : { type : "inflection", pos : "pronoun", inflectionof : "", "case" : "", gender : "", quantity : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-h" : {
		// # {{form of|accusative feminine plural|qui|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{form of\|(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) (:<gender>(?:m|f|n))(?:asculine|eminine|euter) (:<quantity>(?:s|p))(?:ingular|lural)\|(:<inflectionof>[^|{]+)\|lang=la\}\}[^\n]*\s+/),
		"defaults" : { type : "inflection", pos : "pronoun", inflectionof : "", "case" : "", gender : "", quantity : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"definition" : {
		// definition
		"test" : namedRegexp(/^#[^\n]+\s*/),
		"next" : ["inflection","definition","word","inflections"],
		"preprocess" : processDefinition
	}
};

PronounSM.prototype.startState = "start";