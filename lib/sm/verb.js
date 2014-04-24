var util = require("util");
var sst = require("sst");
var namedRegexp = require('named-regexp').named;

module.exports = VerbSM = function(){
	if (!(this instanceof VerbSM))
		return new VerbSM();
	
	sst.call(this);
};
util.inherits(VerbSM,sst);

VerbSM.prototype.cleanWord = function(info){
	this.processDefaults(info);
	
	if (info.results.pattern)
		info.results.pattern = info.results.pattern.replace(/\[\[([^\]]+)\]\]/g,"$1");
	if (info.results.pattern === "irregular passive voice")
		info.results.pattern = "irregular passive";
	if (info.results.pattern === "no perfect forms")
		info.results.pattern = "no perfect form";
}

VerbSM.prototype.cleanInflection = function(info){
	this.processDefaults(info);
	
	if (info.results.person && info.results.person === "first")
		info.results.person = "1";
	if (info.results.person && info.results.person === "second")
		info.results.person = "2";
	if (info.results.person && info.results.person === "third")
		info.results.person = "3";
}

VerbSM.prototype.states = {
	"start" : {
		"next" : ["word","inflections"]
	},
	"word-a" : {
		// {{la-verb|libero|līberō|liberare#Latin|līberāre|liberavi|līberāvī|liberatum|līberātum}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|(:<perfect>[^|}\n]+)\|(:<perfect_>[^|}\n]+)\|(:<supine>[^|}\n]+)\|(:<supine_>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "supine" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-b" : {
		// {{la-verb|fero|ferō|ferre|ferre|tuli|tulī|latum|lātum|pattern=[[irregular]]}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|(:<perfect>[^|}\n]*)\|(:<perfect_>[^|}\n]*)\|(:<supine>[^|}\n]+)\|(:<supine_>[^|}\n]+)\|pattern=(:<pattern>(?:irregular|\[\[irregular\]\]|limited \[\[passive\]\]|\[\[defective\]\]|no \[\[passive\]\]|\[\[supine\]\] stem unattested|\[\[semi-deponent\]\]|\[\[irregular\]\]; no \[\[passive\]\]|irregular \[\[passive voice\]\]|irregular \[\[passive\]\]|no \[\[supine\]\]|no perfect forms|no \[\[perfect\]\] form))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "supine" : "", "pattern" : "" },
		"preprocess" : VerbSM.prototype.cleanPattern,
		"next" : ["inflection","definition","word"]
	},
	"word-c" : {
		// {{la-verb|for|for|fari|fārī|fatus|fātus sum}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|(:<perfect_>[^|}\n]+)\|(:<perfect>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "supine" : "", "pattern" : "deponent" },
		"next" : ["inflection","definition","word"]
	},
	"word-d" : {
		// {{la-verb|alo|alō|alere|alere|alui|aluī|altum|altum|sup2=alitum}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|(:<perfect>[^|}\n]+)\|(:<perfect_>[^|}\n]+)\|(:<supine>[^|}\n]+)\|(:<supine_>[^|}\n]+)\|sup2=(:<supine2>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "supine" : "", "supine2" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-e" : {
		// {{la-verb|sum|sum|esse|esse|fui|fuī|futurus|futūrus|pattern=irregular|44=future participle}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|(:<perfect>[^|}\n]+)\|(:<perfect_>[^|}\n]+)\|(:<futureparticiple>[^|}\n]+)\|(:<futureparticiple_>[^|}\n]+)\|pattern=(?:\[\[)?(:<pattern>(?:irregular|\[\[irregular\]\]|limited \[\[passive\]\]|\[\[defective\]\]|no \[\[passive\]\]|\[\[supine\]\] stem unattested|\[\[semi-deponent\]\]|\[\[irregular\]\]; no \[\[passive\]\]))(?:\]\]|irregular \[\[passive voice\]\]|irregular \[\[passive\]\]|no \[\[supine\]\])?\|44=future participle\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "futureparticiple" : "", "pattern" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-f" : {
		// {{la-verb|abambulo|abambulō|abambulare|abambulāre|pattern=no [[perfect]] or [[supine]] forms}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|pattern=(:<pattern>(?:no \[\[perfect\]\] or \[\[supine\]\] forms|no \[\[perfect\]\] conjugation))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "supine" : "", "pattern" : "no perfect or supine forms" },
		"preprocess" : VerbSM.prototype.cleanWord,
		"next" : ["inflection","definition","word"]
	},
	"word-g" : {
		// {{head|la|verb|head=albēscō|[[defective verb|defective conjugation]]}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|verb\|head=[^|}\n]+\|\[\[defective verb\|defective conjugation\]\]\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "pattern" : "defective" },
		"next" : ["inflection","definition","word"]
	},
	"word-h" : {
		// {{head|la|verb|head=ōdī|present infinitive|ōdisse|supine|ōsum|[[defective]]}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|verb\|head=[^|}\n]+\|present infinitive\|(:<infinitive>[^|}\n]+)\|supine\|(:<supine>[^|}\n]+)\|(:<pattern>(?:irregular|\[\[irregular\]\]|limited \[\[passive\]\]|\[\[defective\]\]|no \[\[passive\]\]|\[\[supine\]\] stem unattested|\[\[semi-deponent\]\]|\[\[irregular\]\]; no \[\[passive\]\]|irregular \[\[passive voice\]\]|irregular \[\[passive\]\]|no \[\[supine\]\]))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "supine" : "", "pattern" : "" },
		"preprocess" : VerbSM.prototype.cleanWord,
		"next" : ["inflection","definition","word"]
	},
	"word-i" : {
		// {{la-verb|hirrio|hirriō|hirrire|hirrīre}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}\n]+)\|(:<infinitive_>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "pattern" : "no perfect or supine forms" },
		"next" : ["inflection","definition","word"]
	},
	"word-j" : {
		// {{la-verb|abhorreo|abhorreō|abhorrere|abhorrēre|abhorrui|abhorruī|pattern=no [[passive]]}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|(:<perfect>[^|}\n]+)\|(:<perfect_>[^|}\n]+)\|pattern=(:<pattern>(?:irregular|\[\[irregular\]\]|limited \[\[passive\]\]|\[\[defective\]\]|no \[\[passive\]\]|\[\[supine\]\] stem unattested|\[\[semi-deponent\]\]|\[\[irregular\]\]; no \[\[passive\]\]|irregular \[\[passive voice\]\]|irregular \[\[passive\]\]|no \[\[supine\]\]))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "pattern" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-k" : {
		// {{la-verb|egeo|egeō|egere|egēre|egui|eguī|egiturus|egitūrus|44=future participle}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|(:<perfect>[^|}\n]+)\|(:<perfect_>[^|}\n]+)\|(:<futureparticiple>[^|}\n]+)\|(:<futureparticiple_>[^|}\n]+)\|44=future participle\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "futureparticiple" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-l" : {
		// {{head|la|verb|not declined}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|verb\|not declined\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "conjugation" : "undeclinable" },
		"next" : ["inflection","definition","word"]
	},
	"word-m" : {
		// {{la-verb|affido|affidō|affidare|affidāre|affidavi|affidāvi|affidatum|affidātum|first}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|(:<perfect>[^|}\n]*)\|(:<perfect_>[^|}\n]*)\|(:<supine>[^|}\n]+)\|(:<supine_>[^|}\n]+)\|(:<conjugation>(?:first))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "supine" : "", "conjugation" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-n" : {
		// {{head|la|verb|head=apocopō}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|verb\|head=(:<word_>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb" },
		"next" : ["inflection","definition","word"]
	},
	"word-o" : {
		// {{la-verb|nolo|nōlō|nolle|nōlle|nolui|nōlui|irregular}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-verb\|(:<word>[^|}\n]+)\|(:<word_>[^|}\n]+)\|(:<infinitive>[^|}#\n]+)(?:#[^|}\n]+)?\|(:<infinitive_>[^|}\n]+)\|(:<perfect>[^|}\n]*)\|(:<perfect_>[^|}\n]*)\|(:<pattern>(?:irregular))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "verb", "infinitive" : "", "perfect" : "", "pattern" : "" },
		"preprocess" : VerbSM.prototype.cleanPattern,
		"next" : ["inflection","definition","word"]
	},
	"inflections-a" : {
		// {{la-verb-form|piēs}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-verb-form\|[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-b" : {
		// {{head|la|verb form|head=cavē}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|verb form\|head=[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-c" : {
		// '''perdere'''
		"type" : "inflections",
		"test" : namedRegexp(/(?:^|\n)'''[^'\n]+'''[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-d" : {
		// {{it-verb}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{it-verb\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-e" : {
		// {{head|la|verb form}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|verb form\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-f" : {
		// {{head|la|...
		"type" : "inflections",
		"test" : namedRegexp(/(?:^|\n)(?=\{\{head\|la\|verb form\|)/),
		"next" : ["inflection"]
	},
	"inflections-g" : {
		// {{head|la}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-h" : {
		// ''faxo''
		"type" : "inflections",
		"test" : namedRegexp(/(?:^|\n)''(:<word_>[^'\n]+)''[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-i" : {
		// {{head|la|verb|cat=verb forms}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|verb\|cat=verb forms\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflection-a" : {
		// # {{conjugation of|piō||2|s|pres|act|sub|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{conjugation of\|(:<inflectionof>[^|}\n]+)\|\|(:<person>(?:1|2|3))\|(:<quantity>(?:s|p))\|(:<tense>(?:pres|fut))\|(:<voice>(?:act|pass))\|(:<form>(?:ind|sub|imp))\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "verb", "inflectionof" : "", "person" : "", "quantity" : "", "tense" : "", "voice" : "", "form" : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-b" : {
		// # {{form of|second-person singular present imperative|caveō|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{form of\|(:<person>(?:first|second|third))-person (:<quantity>(?:s|p))(?:ingular|plural) (:<tense>(?:pres))(?:ent) (:<form>(?:imp))(?:erative)\|(:<inflectionof>[^|}\n]+)\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "verb", "inflectionof" : "", "person" : "", "quantity" : "", "tense" : "", "voice" : "act", "form" : "" },
		"preprocess" : VerbSM.prototype.cleanInflection,
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-c" : {
		// # ''present active infinitive of'' '''[[perdo#Latin|perdō]]'''.
		"type" : "inflection",
		"test" : namedRegexp(/^# ''(:<tense>(?:pres))(?:ent) (:<voice>(?:act|pass))(?:ive) (:<form>(?:inf))(?:initive) of'' '''\[\[(:<inflectionof>[^\]'#\n]+)(?:#[^\]'\n]+)?\|[^\]\n]+\]\]'''\.?[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "verb", "inflectionof" : "", "tense" : "", "voice" : "", "form" : "" },
		"preprocess" : VerbSM.prototype.cleanInflection,
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-d" : {
		// # {{conjugation of|invītō||pres|act|inf|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{conjugation of\|(:<inflectionof>[^|}\n]+)\|\|(:<tense>(?:pres|fut))\|(:<voice>(?:act|pass))\|(:<form>(?:inf))\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "verb", "inflectionof" : "", "tense" : "", "voice" : "", "form" : "" },
		"preprocess" : VerbSM.prototype.cleanInflection,
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-e" : {
		// {{head|la|verb form|third person singular perfect tense of|affido}} <!-- citation form is "affido", right? -->
		"type" : "inflection",
		"test" : namedRegexp(/(?:^|\n)\{\{head\|la\|verb form\|(:<person>(?:first|second|third)) person (:<quantity>(?:s|p))(?:ingular|plural) (:<tense>(?:pres|fut|perf))(?:ent|ure|ect) tense of\|(:<inflectionof>[^|}\n]+)\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "verb", "inflectionof" : "", "person" : "", "quantity" : "", "tense" : "", "voice" : "act", "form" : "ind" },
		"preprocess" : VerbSM.prototype.cleanInflection,
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-f" : {
		// # [[first person|First person]] [[singular]] [[perfect]] [[indicative]] of '''[[assideo]]'''.
		"type" : "inflection",
		"test" : namedRegexp(/^# \[\[(:<person>(?:first|second|third)) person\|[^\]\n]*\]\] \[\[(:<quantity>(?:s|p))(?:ingular|plural)\]\] \[\[(:<tense>(?:pres|fut|perf))(?:ent|ure|ect)\]\] \[\[(:<form>(?:ind))(?:icative)\]\] of '''\[\[(:<inflectionof>[\]'\n]+)\]\]'''\.[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "verb", "inflectionof" : "", "person" : "", "quantity" : "", "tense" : "", "voice" : "act", "form" : "" },
		"preprocess" : VerbSM.prototype.cleanInflection,
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-g" : {
		// # ''[[third person]] [[singular]] [[present tense|present]] [[subjunctive]] of'' '''[[respondere]]'''
		"type" : "inflection",
		"test" : namedRegexp(/^# ''\[\[(:<person>(?:first|second|third)) person\]\] \[\[(:<quantity>(?:s|p))(?:ingular|plural)\]\] \[\[(:<tense>(?:pres|fut|perf))(?:ent|ure|ect) tense\|[^|}\n]+\]\] \[\[(:<form>(?:ind|sub))(?:icative|junctive)\]\] of'' '''\[\[(:<inflectionof>[^\]'\n]+)\]\]'''[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "verb", "inflectionof" : "", "person" : "", "quantity" : "", "tense" : "", "form" : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"definition" : {
		// definition
		"test" : namedRegexp(/^#[^\n]+\s*/),
		"next" : ["definition","word"],
		"preprocess" : require("./definition")
	}
};

VerbSM.prototype.startState = "start";