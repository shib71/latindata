var util = require("util");
var sst = require("sst");
var namedRegexp = require('named-regexp').named;
var processDefinition = require("./definition");

module.exports = NounSM = function(){
	if (!(this instanceof NounSM))
		return new NounSM();
	
	sst.call(this);
};
util.inherits(NounSM,sst);

NounSM.prototype.processGenders = function(info){
	var g1 = info.matches.captures.gender1 ? info.matches.capture("gender1").toLowerCase() : "m";
	var g2 = info.matches.captures.gender2 ? info.matches.capture("gender2").toLowerCase() : "f";
	var g3 = info.matches.captures.gender3 ? info.matches.capture("gender3").toLowerCase() : "n";
	
	if (g1 === "c") g1 = "m";
	if (g2 === "c") g2 = "f";
	
	info.results = [{ 
		"type" : "word", 
		"pos" : "noun" 
	},{ 
		"type" : "inflection", 
		"pos" : "noun", 
		"word" : this.meta.word, 
		"inflectionof" : this.meta.word, 
		"case" : "nom", 
		"gender" : g1
	},{ 
		"type" : "inflection", 
		"pos" : "noun", 
		"word" : info.matches.capture("word2"), 
		"inflectionof" : this.meta.word,
		"case" : "nom", 
		"gender" : g2
	},{ 
		"type" : "inflection", 
		"pos" : "noun", 
		"word" : info.matches.capture("word3"), 
		"inflectionof" : this.meta.word,
		"case" : "nom", 
		"gender" : g3
	}];
}

NounSM.prototype.processGenitiveEnding = function(info){
	this.processDefaults(info);
	
	if (info.matches.captures.genitiveending === undefined || info.matches.captures.genitiveending.length === 0)
		return;
	
	info.results.genitive = this.meta.word + info.matches.capture("genitiveending");
}

NounSM.prototype.cleanupInflection = function(info){
	this.processDefaults(info);
	
	if (info.results.case)
		info.results.case = info.results.case.toLowerCase();
}

NounSM.prototype.deriveAdjective = function(info){
	if (info.matches.captures.declension && info.matches.capture("declension") === "1&2"){
		info.results = {
			"type" : "word",
			"pos" : "adjective",
			"declension" : "1&2",
			"stem" : info.matches.capture("stem"),
			"feminine" : info.matches.capture("stem") + "a",
			"neuter" : info.matches.capture("stem") + "um"
		};
	}
}

NounSM.prototype.states = {
	"start" : {
		"next" : ["word","inflections"]
	},
	"word-a" : {
		// {{la-noun|aquila|aquilae|aquilae|f|first}}
		// {{la-noun|thēsaurus|thesauri|thēsaurī|m|second}}
		// {{la-noun|abactor|abactoris|abactōris|m|third}}
		// {{la-noun|abdōmen|abdominis#Latin|abdōminis|n|third}}
		"type" : "word",
		"test" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<word_>[^|}]+)\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|(:<genitive_>[^|}]+)\|(:<gender>(?:m|f|n))\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-b" : {
		// {{head|la|noun}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-c" : {
		// {{head|la|noun|head=ȳ|{{l|en|indeclinable}}}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|head=[^|}]+\|\{\{l[|\/]en\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-d" : {
		// {{la-noun|diēs||diēī|m|g2=f|fifth}}
		"type" : "word",
		"test" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<word_>[^|}]+)\|\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|(:<gender>(?:m|f|n))\|g2=(:<gender>(?:m|f|n))\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "gender2" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-e" : {
		// '''tax''' {{g|m}}
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''[^'\n]+''' \{\{g\|(:<gender>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-f" : {
		// {{head|la|proper noun}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|proper noun\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-g" : {
		// {{la-noun|index|indicis|indicis|m|g2=f|third}}
		"type" : "word",
		"test" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<word_>[^|}]+)\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|[^|}]+\|(:<gender>(?:m|f|n))\|g2=(:<gender>(?:m|f|n))\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "gender2" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-h" : {
		// '''sapphīre''' {{f}}
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''[^'\n]+''' \{\{(:<gender>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-i" : {
		// {{la-noun-multidecl|Abdēra|Abderorum|Abdērōrum|Abderae|Abdērae|n|f|second|first}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-noun-multidecl\|(:<word_>[^|}]+)\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|(:<genitive_>[^|}]+)\|(:<genitive2>[^|}#]+)(?:#[^|}]+)?\|(:<genitive2_>[^|}]+)\|(:<gender>(?:m|f|n))\|(:<gender2>(?:m|f|n))\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\|(:<declension2>(?:invariable|irregular|first|second|third|fourth|fifth))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "declension" : "", "genitive2" : "", "gender2" : "", "declension2" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-j" : {
		// {{la-noun|lynx|lyncis|lyncis|c|third}}
		"type" : "word",
		"test" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<word_>[^|}]+)\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|(:<genitive_>[^|}]+)\|c\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "m/f", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-k" : {
		// {{head|la|noun|head=lāser|g=n}}
		// {{head|la|proper noun|head=Pērseus|g=m}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|(?:noun|proper noun)\|head=[^|}\n]+\|g=(:<gender>(?:m|f|n))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-l" : {
		// {{head|la|noun|[[indeclinable]]}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|\[\[indeclinable\]\]\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "declension" : "indeclinable" },
		"next" : ["inflection","definition","word"]
	},
	"word-m" : {
		// {{head|la|noun|head=nīl|[[indeclinable]]}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|head=[^|}\n]+\|\[\[indeclinable\]\]\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "declension" : "indeclinable" },
		"next" : ["inflection","definition","word"]
	},
	"word-n" : {
		// '''bēta''' (''[[indeclinable]]''); {{n}}
		"type" : "word",
		"test" : namedRegexp(/'''[^'\n]+''' \(''\[\[indeclinable\]\]''\); \{\{(:<gender>(?:m|f|n))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "declension" : "indeclinable" },
		"next" : ["inflection","definition","word"]
	},
	"word-o" : {
		// {{head|la|noun|head=zēta|g=n|{{l/en|indeclinable}}}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|head=[^|}\n]+\|g=(:<gender>(?:m|f|n))\|\{\{l\/en\|indeclinable\}\}\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "declension" : "indeclinable" },
		"next" : ["inflection","definition","word"]
	},
	"word-p" : {
		// '''echo''' {{g|f}} (''plural'' '''echus''')
		"type" : "word",
		"test" : namedRegexp(/'''[^']+''' \{\{g\|(:<gender>(?:m|f|n))\}\} \(''[^']+'' '''[^']+'''\)[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-q" : {
		// {{head|la|noun|g=m}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|g=(:<gender>(?:m|f|n))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-r" : {
		// {{head|la}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-s" : {
		// '''Cyclades''' {{p}}
		"type" : "word",
		"test" : namedRegexp(/'''[^']+''' \{\{(:<quantity>(?:s|p))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-t" : {
		// {{head|la|noun}}{{attention|la|needs proper template}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\}\}\{\{attention\|[^\n}]+\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-u" : {
		// {{la-noun|veterēs|veterum|veterum|m-p|third}}
		"type" : "word",
		"test" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<word_>[^|}]+)\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|(:<genitive_>[^|}]+)\|(:<gender>(?:m|f|n))-p\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "declension" : "", "qualifier" : "plural" },
		"next" : ["inflection","definition","word"]
	},
	"word-v" : {
		// nominative plural '''Syracusae''', genitive plural '''Syracusārum''' ''f pl.''
		"type" : "word",
		"test" : namedRegexp(/nominative plural '''[^'\n]+''', genitive plural '''(:<genitive>[^'\n]+)''' ''(:<gender>(?:m|f|n)) pl\.''[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "qualifier" : "plural" },
		"next" : ["inflection","definition","word"]
	},
	"word-w" : {
		// '''dynastes''' {{g|m}} (Plural: [[dynastae]])
		"type" : "word",
		"test" : namedRegexp(/'''[^'\n]+''' \{\{g\|(:<gender>(?:m|f|n))\}\} \(Plural: \[\[[^\]\n]+\]\]\)[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-x" : {
		// '''campe''' {{f}} (Plural: [[campae]], Accusative: [[campen]], Genitive: [[campes]], Ablative: [[campe]])
		"type" : "word",
		"test" : namedRegexp(/'''[^'\n]+''' \{\{(:<gender>(?:m|f|n))\}\} \(Plural: \[\[[^\]\n]+\]\], Accusative: \[\[(:<accusative>[^\]\n]+)\]\], Genitive: \[\[(:<genitive>[^\]\n]+)\]\], Ablative: \[\[(:<ablative>[^\]\n]+)\]\]\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-y" : {
		// {{head|la|proper noun|g=m|Plural|Kaesones|Abbreviation|K}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|(?:noun|proper noun)\|g=(:<gender>(?:m|f|n))\|Plural\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|Abbreviation\|(:<abbreviation>[^|}\n]+)\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "qualifier" : "plural" },
		"next" : ["inflection","definition","word"]
	},
	"word-z" : {
		// {{la-noun-multidecl|femur|feminis|feminis|femoris|femoris|n|third|third}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-noun-multidecl\|(:<word_>[^|}]+)\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|(:<genitive_>[^|}]+)\|(:<genitive2>[^|}#]+)(?:#[^|}]+)?\|(:<genitive2_>[^|}]+)\|(:<gender>(?:m|f|n))\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\|(:<declension2>(?:invariable|irregular|first|second|third|fourth|fifth))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-aa" : {
		// '''Servius''' ''m'' (Plural: [[Servii]], Abbreviation: [[Ser]])
		"type" : "word",
		"test" : namedRegexp(/'''[^'\n]+''' ''(:<gender>(?:m|f|n))'' \(Plural: \[\[(:<plural>[^\n\]]+)\]\], Abbreviation: \[\[(:<abbreviation>[^\n\]]+)\]\]\)[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ab" : {
		// {{head|la|proper noun|g=f}} (Plural: [[Ninevae]], Accusative: [[Nineven]], Genitive: [[Nineves]], Ablative: [[Nineve]])
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|(?:noun|proper noun)\|g=(:<gender>(?:m|f|n))\}\} \(Plural: \[\[(:<plural>[^\n\]]+)\]\], Accusative: \[\[(:<accusative>[^\n\]]+)\]\], Genitive: \[\[(:<genitive>[^\n\]]+)\]\], Ablative: \[\[(:<ablative>[^\n\]]+)\]\]\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ac" : {
		// '''ursae''' ''f''
		"type" : "word",
		"test" : namedRegexp(/'''[^'\n]+''' ''(:<gender>(?:m|f|n))''[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ad" : {
		// {{la-location|Carthāgō|Carthaginis|Carthāginis|Carthagine|Carthāgine|f|sg|third}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-location\|[^|}\n]+\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|(:<genitive_>[^|}#]+)(?:#[^|}]+)?\|(:<dative>[^|}]+)\|(:<dative_>[^|}]+)\|(:<gender>(?:m|f|n))\|[^|}\n]+\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ae" : {
		// {{la-noun|volantēs|volantium|volantium|c, pl|third}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-noun\|[^|}\n]+\|(:<genitive>[^|}\n]+)\|(:<genitive_>[^|}\n]+)\|c, pl\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "m/f", "genitive" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-af" : {
		// '''Thebani''' {{m-p}}
		"type" : "word",
		"test" : namedRegexp(/'''[^'\n]+''' \{\{(:<gender>(?:m|f|n))-p\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ag" : {
		// {{la-noun|pēra||pērae|f|first}}
		"type" : "word",
		"test" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<word_>[^|}]+)\|\|(:<genitive>[^|}#]+)(?:#[^|}]+)?\|(:<gender>(?:m|f|n))\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ah" : {
		// {{head|la|proper noun|g=m}} (''genitive:'' '''Urani'''), Second declension
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|proper noun\|g=(:<gender>(?:m|f|n))\}\} \(''genitive:'' '''(:<genitive>[^'\n]+)'''\), (:<declension>(?:invariable|irregular|first|second|third|fourth|fifth)) declension[^\n]*(\n\s*|$)/i),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ai" : {
		// '''proprietor''', genitive proprietoris
		"type" : "word",
		"test" : namedRegexp(/(^|\n)'''[^'\n]+''', genitive (:<genitive>[^\s]+)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-aj" : {
		// {{head|la|proper noun|g=f|head=Christiānitās}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|(?:noun|proper noun)\|g=(:<gender>(?:m|f|n))\|head=[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ak" : {
		// {{head|la|noun|g=n|indeclinable}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|g=(:<gender>(?:m|f|n))\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-al" : {
		// '''Beelzebub''' ''indeclinable'' {{m}}
		"type" : "word",
		"test" : namedRegexp(/(^|\n)'''[^'\n]+''' ''(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))'' \{\{(:<gender>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-am" : {
		// '''posse''' {{attention|la}}
		"type" : "word",
		"test" : namedRegexp(/(^|\n)'''[^'\n]+''' \{\{attention\|la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-an" : {
		// {{head|la|noun|plural|dracunculi}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|plural\|(:<plural>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-ao" : {
		// '''Sapphō''' {{f}} ''[[Appendix:Latin fourth declension|4th declension]]''
		"type" : "word",
		"test" : namedRegexp(/(^|\n)'''[^'\n]+''' \{\{(:<gender>(?:m|f|n))\}\} ''\[\[Appendix:Latin (:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable)) declension\|4th declension\]\]''[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ap" : {
		// {{head|la|noun|g=n|genitive|puris}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|g=(:<gender>(?:m|f|n))\|genitive\|(:<genitive>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-aq" : {
		// {{head|la|proper noun}} {{m}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|proper noun\}\} \{\{(:<gender>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ar" : {
		// '''Harrius''', ''m''; genitive '''[[Harrii]]''' Second declension
		"type" : "word",
		"test" : namedRegexp(/(^|\n)'''[^'\n]+''', ''(:<gender>(?:m|f|n))''; genitive '''(:<genitive>[^'\n]+)''' (:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable)) declension[ \t]*(\n\s*|$)/i),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-as" : {
		// '''masturbatio''' {{f}} (''genitive:'' '''masturbationis''')
		"type" : "word",
		"test" : namedRegexp(/(^|\n)'''[^'\n]+''' \{\{(:<gender>(?:m|f|n))\}\} \(''genitive:'' '''(:<genitive>[^'\n]+)'''\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-at" : {
		// {{head|la|noun}} (plural '''[[polyzoa]]''')
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\}\} \(plural '''\[\[[^\]'\n]+\]\]'''\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-au" : {
		// '''Plato''' {{m}} ([[Platonis]])
		"type" : "word",
		"test" : namedRegexp(/(^|\n)'''[^'\n]+''' \{\{(:<gender>(?:m|f|n))\}\} \(\[\[(:<genitive>[^\]\)\n]+)\]\]\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-av" : {
		// {{head|la|proper noun}}{{attention|la|no gender of inflection}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|proper noun\}\}\s*\{\{attention\|la\|no gender of inflection\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-aw" : {
		// {{head|la|proper noun|g=m}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|proper noun\|g=(:<gender>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ax" : {
		// {{head|la|noun|head=Sīrēn|f}} ([[Sirenis|Sīrēnis]])
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|head=[^|}\n]+\|(:<gender>(?:m|f|n))\}\} \(\[\[(:<genitive>[^\]\)\n]+)\|(:<genitive_>[^\]\)\n]+)\]\]\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ay" : {
		// {{head|la|proper noun|g=f}} (''plural'': [[Sphinges]])
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|proper noun\|g=(:<gender>(?:m|f|n))\}\} \(''plural'': \[\[(:<plural>[^\]\n]+)\]\]\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-az" : {
		// {{head|la|noun|feminine of|barbarus}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|(:<gender>(?:m|f|n))(?:eminine|asculine|euter) of\|[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-ba" : {
		// {{head|la|noun|head=tīgris|g=m|genitive|tigris|or|tīgridis}}, ''[[Appendix:Latin third declension|third declension]]''
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|head=[^|}\n]+\|g=(:<gender>(?:m|f|n))\|genitive\|(:<genitive>[^|}\n]+)\|or\|(:<genitive2>[^|}\n]+)\}\}, ''\[\[[^\]\n]+\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable)) declension\]\]''[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "", "genitive2" : "", "declension" : ""},
		"next" : ["inflection","definition","word"]
	},
	"word-bb" : {
		// {{la-decl-1&2|plex}}
		"type" : "word",
		"test" : namedRegexp(/\{\{la-decl-(:<declension>(?:1&2))\|(:<stem>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"preprocess" : NounSM.prototype.deriveAdjective,
		"next" : ["inflection","definition","word"]
	},
	"word-bc" : {
		// {{head|la|noun|head=fīcus|plural'' '''[[fici#Latin|fīcī]]''', ''[[Appendix:Latin second declension|second declension]], or'' '''[[ficus#Latin|fīcūs]]''', ''[[Appendix:Latin fourth declension|fourth declension]]|g=m|g2=f}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|head=[^|}\n]+\|plural'' '''\[\[[^|\]\n]+\|[^|\]\n]+\]\]''', ''\[\[Appendix:Latin (:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable)) declension\|(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable) declension\]\], or'' '''\[\[[^|\]\n]+\|[^|\]\n]+\]\]''', ''\[\[Appendix:Latin (:<declension2>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable)) declension\|(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable) declension\]\]\|g=(:<gender>(?:m|f|n))\|g2=(:<gender2>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "declension" : "", "gender" : "", "declension2" : "", "gender2" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bd" : {
		// {{head|la|noun|genitive|dīvitis}}{{attention|la|needs full inflection}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|genitive\|(:<genitive>[^|}\n]+)\}\}\{\{attention\|[^}\n]+\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-be" : {
		// '''Versaliae''' ''f pl''
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''[^'\n]+''' ''(:<gender>(?:m|f|n)) pl''[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "pattern" : "plural" },
		"next" : ["inflection","definition","word"]
	},
	"word-bf" : {
		// {{head|la|proper noun|head=Dācia}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|proper noun\|head=(:<word_>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-bg" : {
		// '''alec'''{{attention|la|needs formatting}}
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)'''\{\{attention\|la\|needs formatting\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-bh" : {
		// '''ambrum''' {{n}} (''feminine:'' '''[[ambra]]''')
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \{\{(:<gender>(?:m|f|n))\}\} \(''(:<gender2>(?:m|f|n))(?:asculine|eminine|euter):'' '''(?:\[\[)?(:<word2>[^\]'\n]+)(?:\]\])?'''\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "word2" : "", "gender2" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bi" : {
		// {{head|la|noun|head=ix|head2=īx|{{l/en|indeclinable}}}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|head=[^|}\n]+\|head2=(:<word_>[^|}\n]+)\|\{\{l\/en\|indeclinable\}\}\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "declension" : "indeclinable" },
		"next" : ["inflection","definition","word"]
	},
	"word-bj" : {
		// '''vituperator''', '''-is''' {{m}} ({{f}}: '''[[vituperatrix]]''')
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''', '''-(:<genitiveending>[^'\n]+)''' \{\{(:<gender>(?:m|f|n))\}\} \(\{\{(:<gender2>(?:m|f|n))\}\}: '''\[\[(:<word2>[^\]'\n]+)\]\]'''\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "word2" : "", "gender2" : "" },
		"preprocess" : NounSM.prototype.processGenitiveEnding,
		"next" : ["inflection","definition","word"]
	},
	"word-bk" : {
		// '''caupō''' {{m}} (''plural:'' '''cauponēs''')
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \{\{(:<gender>(?:m|f|n))\}\} \(''plural:'' '''[^'\n]+'''\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bl" : {
		// {{head|la|noun|head=pīnus|genitive|pinūs|or|pīnī}}; ''f'', ''[[Appendix:Latin fourth declension|fourth declension]] or [[Appendix:Latin second declension|second declension]]''
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|head=(:<word_>[^|}\n]+)\|genitive\|(:<genitive>[^|}\n]+)\|or\|(:<genitive2>[^|}\n]+)\}\}; ''(:<gender>(?:m|f|n))'', ''\[\[Appendix:[^|\n\]]+\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable)) declension\]\] or \[\[Appendix:[^|\n\]]+\|(:<declension2>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable)) declension\]\]''[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "genitive2" : "", "declension" : "", "declension2" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bm" : {
		// {{head|la|noun|head=fās|g=n|no genitive singular form}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|head=(:<word_>[^|}\n]+)\|g=(:<gender>(?:m|f|n))\|no genitive singular form\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bn" : {
		// '''frigidarium''' (''plural'' '''[[frigidaria]]''')
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \(''plural'' '''\[\[(:<plural>[^'\]\n]+)\]\]'''\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-bo" : {
		// '''papau'''|'''er, -eris''' ((n)) (earlier {{m}})
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)'''\|'''\w+, -\w+''' \(\((:<gender>(?:m|f|n))\)\) \(earlier \{\{(:<gender2>(?:m|f|n))\}\}\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "gender2" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bp" : {
		// '''vesper''' (''genitive'' '''[[vesperi#Latin|vesperī]]'''); {{m}}, ''[[Appendix:Latin second declension|second]] declension''
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \(''genitive'' '''\[\[(:<genitive>[^|}\n*]+)(?:#[^|}\n]+)?\|(:<genitive_>[^|}\n*]+)\]\]'''\); \{\{(:<gender>(?:m|f|n))\}\}, ''\[\[Appendix:[^|\]']+\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable))\]\] declension''[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bq" : {
		// '''Sina''' (''genitive'' '''[[Sinae]]'''); {{f}}, ''[[Appendix:Latin first declension|first declension]]''
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \(''genitive'' '''\[\[(:<genitive>[^\]'\n]+)\]\]'''\); \{\{(:<gender>(?:m|f|n))\}\}, ''\[\[Appendix:[^|\]\n]+\|(:<declension>(?:invariable|irregular|first|second|third|fourth|fifth|indeclinable)) declension\]\]''[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "genitive" : "", "gender" : "", "declension" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-br" : {
		// '''gry''' {{n}} {{qualifier|indeclinable}}
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \{\{(:<gender>(?:m|f|n))\}\} \{\{qualifier\|indeclinable\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "declension" : "undeclinable" },
		"next" : ["inflection","definition","word"]
	},
	"word-bs" : {
		// {{head|la|proper noun|g=m}} (''feminine'': [[Pompeia]])
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|proper noun\|g=(:<gender>(?:m|f|n))\}\} \(''(:<gender1>(?:m|f|n))(?:asculine|eminine|euter)'': \[\[(:<word2>[^\]\n]+)\]\]\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "word2" : "", "gender2" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bt" : {
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|noun\|g=(:<gender>(?:m|f|n))-p\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "quantity" : "p" },
		"next" : ["inflection","definition","word"]
	},
	"word-bu" : {
		// '''faciendum''' (pl. ''[[facienda]]'')
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \(pl. ''\[\[(:<plural>[^\]']+)\]\]''\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun" },
		"next" : ["inflection","definition","word"]
	},
	"word-bv" : {
		// {{head|la|proper noun|g=f|locative|Snelandiae}}
		"type" : "word",
		"test" : namedRegexp(/\{\{head\|la\|proper noun\|g=(:<gender>(?:m|f|n))\|locative\|(:<genitive>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "", "genitive" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bw" : {
		// '''lessus''' (''accusative singular'' '''[[lessum]]''') {{m}}
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \(''accusative singular'' '''\[\[[^\]'\n]+\]\]'''\) \{\{(:<gender>(?:m|f|n))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"word-bx" : {
		// '''epos''' {{n}} (-)
		"type" : "word",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \{\{(:<gender>(?:m|f|n))\}\} \(-\)[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "word", "pos" : "noun", "gender" : "" },
		"next" : ["inflection","definition","word"]
	},
	"inflections-a" : {
		// {{la-noun-form|eurō}} 
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-noun-form\|[^|}]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-b" : {
		// {{la-noun-form|digitō|g=m}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-noun-form\|[^|}]+\|g=(?:m|f|n)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-c" : {
		// {{head|la|noun form}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|noun form\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-d" : {
		// {{head|la|noun form|g=m}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|noun form\|g=(?:m|f|n)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-e" : {
		// {{head|la|noun form|head=ōre|n}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|noun form\|head=[^|}\n]+\|(?:m|f|n)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-f" : {
		// {{head|la|noun form|head=āctiōnis}}
		// {{head|la|proper noun form|head=Iēsū}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|(noun form|proper noun form)\|head=[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-g" : {
		// {{head|en}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|en\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-h" : {
		// '''pūmice''' {{g|m}} or {{g|f}}
		"type" : "inflections",
		"test" : namedRegexp(/'''[^'\n]+''' \{\{g\|(?:m|f|n)\}\} or \{\{g\|(?:m|f|n)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-i" : {
		// {{la-proper-noun-form|Rōmae}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-proper-noun-form\|[^|}\n]+\}\}[^\n]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-j" : {
		// {{la-noun-form|verme}} {{g|m}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-noun-form\|[^}|\n]+\}\} \{\{g\|.\}\}/),
		"next" : ["inflection"]
	},
	"inflections-k" : {
		// {{head|la|noun form|head=manū|g=f}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|noun form\|head=[^|}\n]+\|g=(?:m|f|n)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-l" : {
		// {{head|la|noun form|g=f|head=lūce}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|noun form\|g=(?:m|f|n)\|head=[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-m" : {
		// '''vēla'''
		"type" : "inflections",
		"test" : namedRegexp(/(^|\n)'''[^'\n]+'''[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-n" : {
		// {{la-noun-form|vērī}} {{n}}
		// {{la-noun-form|fungī}}  {{m}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-noun-form\|[^|}\n]+\}\}\s+\{\{(?:m|f|n)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-o" : {
		// {{la-proper noun-form|Sexte}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-proper noun-form\|[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-p" : {
		// {{la-adj-form|aliō}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-adj-form\|[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection-adj"]
	},
	"inflections-q" : {
		// {{la-noun form|teste}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-noun form\|[^|}]+\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-r" : {
		// {{head|la|noun form|head=māla|g=n-p}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|noun form\|head=[^|}\n]+\|g=(?:m|f|n)-p\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-s" : {
		// {{la-noun-form}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-noun-form\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-t" : {
		// {{la-noun-form|pedēs}} {{p}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-noun-form\|(:<word_>[^|}\n]+)\}\} \{\{p\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-u" : {
		// {{la-noun form|ūri|g=m|g2=p}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-noun form\|(:<word_>[^|}\n]+)\|g=.\|g2=.\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-v" : {
		// '''pūmicis''' {{m}} or {{f}}
		"type" : "inflections",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \{\{(?:m|f|n)\}\} or \{\{(?:m|f|n)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-w" : {
		// '''nūgārum''' {{f}} {{p}}
		"type" : "inflections",
		"test" : namedRegexp(/(?:^|\n)'''(:<word_>[^'\n]+)''' \{\{(?:m|f|n)\}\} \{\{p\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-x" : {
		// {{la-noun form|nimbe|g=m}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{la-noun form\|(:<word_>[^|}\n]+)\|g=(?:m|f|n)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-y" : {
		// {{head|la|noun form|g=f|head=rērumpublicārum}} ''([[republic]])''
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|noun form\|g=(?:m|f|n)\|head=[^|}\n]+\}\} ''\(\[\[[^\]'\n]+\]\]\)''[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflections-z" : {
		// {{head|la|adjective form|head=quadrilātera}}
		"type" : "inflections",
		"test" : namedRegexp(/\{\{head\|la\|adjective form\|head=(:<word_>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"next" : ["inflection"]
	},
	"inflection-a" : {
		// # {{inflection of|eurus||dat|s|lang=la}}
		// # {{inflection of|abolla||voc|s|lang=la}}
		// # {{inflection of|fungus||gen|s|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{inflection of\|(:<inflectionof>[^|}]+)\|\|(:<case>nom|voc|acc|gen|dat|abl)\|(:<quantity>(?:s|p))\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "", "quantity" : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-b" : {
		// # {{ablative of|caro|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) of\|(:<inflectionof>[^|}]+)\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "", "quantity" : "s" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-c" : {
		// #genitive singular, dative singular and nominative plural of [[ursa]]
		"type" : "inflection",
		"test" : namedRegexp(/^#(?=[^\n]*(nominative|vocative|accusative|genitive|dative|ablative)[^\n]+(singular|plural)[^\n]+of \[\[[^\n\]]+\]\]) /),
		"next" : ["sub-inflection"]
	},
	"inflection-d" : {
		// # {{inflection of|Rōma||gen|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{inflection of\|(:<inflectionof>[^|}\n]+)\|\|(:<case>(?:nom|voc|acc|gen|dat|abl))\|lang=la\}\}[^\n]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "", "quantity" : "s " },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-e" : {
		// # {{genitive plural of|caro|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) (:<quantity>(?:s|p))(?:ingular|lural) of\|(:<inflectionof>[^|}\n]+)\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "", "quantity" : "s " },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-f" : {
		// # {{genitive of|sinapi|lang=la|nocat=1}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) of\|(:<inflectionof>[^|}\n]+)\|lang=la\|nocat=1\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "", "quantity" : "s" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-g" : {
		// # {{inflection of|lang=la|hippotoxotae||gen|p}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{inflection of\|lang=la\|(:<inflectionof>[^|}\n]+)\|\|(:<case>(?:nom|voc|acc|gen|dat|abl))\|(:<quantity>(?:s|p))\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "", "quantity" : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-h" : {
		// # {{inflection of|clōstra||nom|n|s|lang=la}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{inflection of\|(:<inflectionof>[^|}\n]+)\|\|(:<case>(?:nom|voc|acc|gen|dat|abl))\|(:<gender>(?:m|f|n))\|(:<quantity>(?:s|p))\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "", "quantity" : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-i" : {
		// # Genitive plural form of '''{{l|la|rēspublica}}'''
		"type" : "inflection",
		"test" : namedRegexp(/^# (:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) (:<quantity>(?:s|p))(?:ingular|lural) form of '''\{\{l\|la\|(:<inflectionof>[^|}\n]+)\}\}'''[ \t]*(\n\s*|$)/i),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "", "quantity" : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-j" : {
		// # {{feminine of|quadrilāterus|lang=la}}{{attention|la|Needs definitions for cases}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{(:<gender>(?:m|f|n))(?:eminine|euter) of\|(:<inflectionof>[^|}\n]+)\|lang=la\}\}\{\{attention\|la\|[^|}\n]+\}\}[ \t]*(\n\s*|$)/),
		"default" : { "type" : "inflection", "pos" : "adjective", "inflectionof" : "", "case" : "nom", "quantity" : "s", "gender" : "" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"inflection-k" : {
		// # {{plural of|lar}}
		"type" : "inflection",
		"test" : namedRegexp(/^# \{\{plural of\|(:<inflectionof>[^|}\n]+)\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "nom", "quantity" : "s" },
		"next" : ["inflection","definition","word","inflections"]
	},
	"sub-inflection-a" : {
		"type" : "sub-inflection",
		"test" : namedRegexp(/(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|itive|ative|usative|ive) (:<quantity>(?:s|p))(?:ingular|plural)(?=[^\n]+of \[\[(:<inflectionof>[^\]\n]+)\]\])/),
		"defaults" : { "type" : "inflection", "pos" : "noun", "inflectionof" : "", "case" : "", "quantity" : "" },
		"preprocess" : NounSM.prototype.cleanupInflection,
		"next" : ["sub-inflection","close-sub-inflection"]
	},
	"close-sub-inflection" : {
		"test" : namedRegexp(/[^\n]+(\n\s*|$)/),
		"next" : ["inflection","definition","word","inflections"]
	},
	"adj-inflection-a" : {
		// # {{inflection of|alius||abl|m|s|lang=la}}
		"type" : "inflection-adj",
		"test" : namedRegexp(/^# \{\{inflection of\|(:<inflectionof>[^|}\n]+)\|\|(:<case>(?:nom|voc|acc|gen|dat|abl))\|(:<gender>(?:m|f|n))\|(:<quantity>(?:s|p))\|lang=la\}\}[ \t]*(\n\s*|$)/),
		"defaults" : { "type" : "inflection", "pos" : "adjective", "inflectionof" : "", "case" : "", "quantity" : "", "gender" : "" },
		"next" : ["inflection-adj","word","inflections"]
	},
	"definition" : {
		// definition
		"test" : namedRegexp(/^#[^\n]+\s*/),
		"next" : ["inflection","definition","word","inflections"],
		"preprocess" : processDefinition
	}
};

NounSM.prototype.startState = "start";