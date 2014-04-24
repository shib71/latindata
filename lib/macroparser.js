var namedRegexp = require('named-regexp').named;
var util = require('util');

var verb_inflections = [{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<tense>[^|]+)\|(:<voice>act|pass)\|(?:inf|infinitive)\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", tense : "", voice : "", mood : "infinitive" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<quantity>s|p)\|imp\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", quantity : "", tense : "", mood : "imperative" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<quantity>s|p)\|(:<tense>[^|]+)\|imp\|(:<voice>act|pass)\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", quantity : "", tense : "", mood : "imperative" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<quantity>s|p)\|(:<tense>[^|]+)\|(:<voice>act|pass)\|imp\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", quantity : "", tense : "", voice : "", mood : "imperative" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<person>1|2|3)\|(:<quantity>s|p)\|(:<tense>[^|]+)\|(:<voice>act|pass)\|imp\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", person : "", quantity : "", tense : "", voice : "", mood : "imperative" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<person>1|2|3)\|(:<quantity>s|p)\|(:<tense>[^|]+)\|pattern=(:<pattern>[^|]+)\|(:<voice>act|pass)\|imp\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", person : "", quantity : "", tense : "", pattern : "", voice : "", mood : "imperative" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<person>1|2|3)\|(:<quantity>s|p)\|(:<tense>[^|]+)\|(:<voice>act|pass)\|(sub|subj)\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", person : "", quantity : "", tense : "", pattern : "", voice : "", mood : "subjunctive" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|supine\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", mood : "supine" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<person>1|2|3)\|(:<quantity>s|p)\|(:<tense>[^|]+)\|ind\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", person : "", quantity : "", tense : "", mood : "indicative" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<person>1|2|3)\|(:<quantity>s|p)\|(:<tense>[^|]+)\|(:<voice>act|pass)\|ind\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", person : "", quantity : "", tense : "", mood : "indicative" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:conjugation of|inflection of)\|(:<word>[^|]+)\|\|(:<person>1|2|3)\|(:<quantity>s|p)\|fut\|perf\|(:<voice>act|pass)\|ind\|lang=la\}\}/),
	default : { type : "inflection", pos : "verb", word : "", person : "", quantity : "", tense : "", mood : "indicative" },
	process : addInflection
}];

var participle_inflections = [{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:inflection of|inflected form of)\|(:<word>[^|]+)\|\|(:<case>nom|voc|acc|gen|dat|abl)\|(:<quantity>s|p)\|lang=la(?:\|nodot=1)?\}\}/),
	default : { type : "inflection", pos : "participle", word : "", "case" : "", quantity : "" },
	process : addInflection
}];

var noun_inflections = [{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:inflection of|inflected form of)\|(:<word>[^|]+)\|\|(:<case>nom|voc|acc|gen|dat|abl)\|(:<quantity>s|p)\|lang=la(?:\|nodot=1)?\}\}/),
	default : { type : "inflection", pos : "noun", word : "", "case" : "", quantity : "" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:inflection of|inflected form of)\|(:<word>[^|]+)\|\|(:<case>nom|voc|acc|gen|dat|abl)\|(:<gender>m|f|n)\|(:<quantity>s|p)\|lang=la(?:\|nodot=1)?\}\}/),
	default : { type : "inflection", pos : "noun", word : "", "case" : "", gender : "", quantity : "" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:inflection of|inflected form of)\|(:<word>[^|]+)\|\|(:<case>nom|voc|acc|gen|dat|abl)\|lang=la(?:\|nodot=1)?\}\}/),
	default : { type : "inflection", pos : "noun", word : "", "case" : "" },
	process : addInflection
},{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{dative of\|(:<word>[^|]+)\|\|lang=la\}\}/),
	default : { type : "inflection", pos : "noun", word : "", "case" : "dat", quantity : null },
	process : addInflection
},{
	// inflection
	// {{ablative of|caro|lang=la}}
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{ablative of\|(:<word>[^|]+)\|\|lang=la\}\}/),
	default : { type : "inflection", pos : "noun", word : "", "case" : "abl", quantity : null },
	process : addInflection
}];

var adjective_inflections = [{
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:inflection of|inflected form of)\|(:<word>[^|]+)\|\|(:<case>nom|voc|acc|gen|dat|abl)\|(:<gender>m|f|n)\|(:<quantity>s|p)\|lang=la(?:\|nodot=1)?\}\}/),
	default : { type : "inflection", pos : "adjective", word : "", form : "positive", "case" : "", gender : "", quantity : "" },
	process : addInflection
},{
	// inflection
	// # the masculine vocative singular of the pronoun ''[[meus]]'' or \"mine\"\n
	group : "inflections", property : "inflections",
	re : namedRegexp(/(?:(?:masculine|vocative|singular)\s*){3}.*''\[\[(:<word>[^\]]+)\]\]''/),
	default : { type : "inflection", pos : "adjective", word : "", form : "positive", "case" : "voc", gender : "m", quantity : "s" },
	process : addInflection
}];

var pronoun_inflections = [{
	// inflection
	// # sometimes the dative of {{term|lang=la|ego}} instead of the more frequent {{term|lang=la|mihi}}\n\n
	group : "inflections", property : "inflections",
	re : namedRegexp(/dative of \{\{term\|lang=la\|ego\}\}/),
	default : { type : "inflection", pos : "pronoun", word : "ego", "case" : "dat", quantity : "s" },
	process : addInflection
},{
	// inflection
	// # {{inflection of|hic||nom|m|p|lang=la}}
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:inflection of|inflected form of)\|(:<word>[^|]+)\|\|(:<case>nom|voc|acc|gen|dat|abl)\|(:<gender>m|f|n)\|(:<quantity>s|p)\|lang=la(?:\|nodot=1)?\}\}/),
	default : { type : "inflection", pos : "pronoun", word : "", "case" : "", gender : "", quantity : "" },
	process : addInflection
},{
	// inflection
	// {{form of|accusative singular|ego|lang=la}}
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{form of\|(:<case>(?:nom|voc|acc|gen|dat|abl))(?:inative|ative|usative|ive) (:<case>(?:s|p))(?:ingular|lural)\|(:<word>[^|]+)\|lang=la(?:\|nodot=1)?\}\}/),
	default : { type : "inflection", pos : "pronoun", word : "", "case" : "", quantity : "" },
	process : addInflection
}];

module.exports = MacroParser = function(type,text,page){
	if (!(this instanceof MacroParser))
		return new MacroParser(type,text);
	
	this.setType(type);
	this.setText(text);
	this.setPage(page);
}

MacroParser.prototype.matchers = {
	"Verb" : [{
		// word 
		// {{la-verb|libero|līberō|liberare#Latin|līberāre|liberavi|līberāvī|liberatum|līberātum}}
		"re" : namedRegexp(/\{\{la-verb\|(:<present_active>[^|]+)\|(:<present_active_>[^|]+)\|(:<present_infinitive>[^|#]+)(?:#[^|]+)?\|(:<present_infinitive_>[^|]+)\|(:<perfect_active>[^|]+)\|(:<perfect_active_>[^|]+)\|(:<supine>[^|]+)\|(:<supine_>[^|}]+)\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "verb", present_active : "", present_infinitive : "", perfect_active : "", supine : "" },
		"process" : splitDefinitions,
		"definitions" : verb_inflections.concat(processDefinition),
	},{
		// word
		// {{la-verb|fero|ferō|ferre|ferre|tuli|tulī|latum|lātum|pattern=[[irregular]]}}
		"re" : namedRegexp(/\{\{la-verb\|(:<present_active>[^|]+)\|(:<present_active_>[^|]+)\|(:<present_infinitive>[^|#]+)(?:#[^|]+)?\|(:<present_infinitive_>[^|]+)\|(:<perfect_active>[^|]+)\|(:<perfect_active_>[^|]+)\|(:<supine>[^|]+)\|(:<supine_>[^|}]+)\|pattern=\[\[(:<pattern>[^|}]+)\]\]\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "verb", present_active : "", present_infinitive : "", perfect_active : "", supine : "", pattern : "" },
		"process" : splitDefinitions,
		"definitions" : verb_inflections.concat(processDefinition),
	},{
		// word
		// {{la-verb|for|for|fari|fārī|fatus|fātus sum}}
		"re" : namedRegexp(/\{\{la-verb\|(:<present_active>[^|]+)\|(:<present_active_>[^|]+)\|(:<present_infinitive>[^|#]+)(?:#[^|]+)?\|(:<present_infinitive_>[^|]+)\|(:<perfect_active>[^|]+)\|(:<perfect_active_>[^|]+)\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "verb", present_active : "", present_infinitive : "", perfect_active : "" },
		"process" : splitDefinitions,
		"definitions" : verb_inflections.concat(processDefinition),
	},{
		// word
		// {{la-verb|alo|alō|alere|alere|alui|aluī|altum|altum|sup2=alitum}}
		"re" : namedRegexp(/\{\{la-verb\|(:<present_active>[^|]+)\|(:<present_active_>[^|]+)\|(:<present_infinitive>[^|#]+)(?:#[^|]+)?\|(:<present_infinitive_>[^|]+)\|(:<perfect_active>[^|]+)\|(:<perfect_active_>[^|]+)\|(:<supine>[^|]+)\|(:<supine_>[^|}]+)\|sup2=(:<supine2>[^|}]+)\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "verb", present_active : "", present_infinitive : "", perfect_active : "", supine : "", supine2 : "" },
		"process" : splitDefinitions,
		"definitions" : verb_inflections.concat(processDefinition),
	},{
		// inflection
		"re" : namedRegexp(/\{\{la-verb-form\|[^}]+\}\}\s+(((:<inflections>#[^\n]+)\n)*)/),
		"default" : { },
		"inflections" : verb_inflections
	}],
	
	"Participle" : [{
		// word
		// {{la-perfect participle|abdit}}
		"re" : namedRegexp(/\{\{la-perfect participle\|(:<stem>[^|]+)\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "participle", stem : "", tense : "perfect" },
		"process" : splitDefinitions,
		"definitions" : participle_inflections.concat(processDefinition)
	},{
		// word
		// {{la-present participle|me||ans}}
		"re" : namedRegexp(/\{\{la-present participle\|(:<stem>[^|]+)\|(:<stem_>[^|]+)\|(:<ending>[^}]})\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "participle", stem : "", ending : "", tense : "present" },
		"process" : splitDefinitions,
		"definitions" : participle_inflections.concat(processDefinition)
	},{
		// inflection
		"re" : namedRegexp(/\{\{la-part-form\|(:<word>[^}]+)\}\}\s+(((:<inflections>#[^\n]+) \n)*)/),
		"default" : {},
		"inflections" : participle_inflections
	}],
	
	"Adverb" : [{
		// word
		"re" : namedRegexp(/\{\{la-adv\|(:<stem>[^|]+)\|(:<stem_>[^|]*)\|(:<ending>(?:e|er|ter|iter|im|-))\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "adverb", stem : "", ending : "" },
		"process" : splitDefinitions,
		"definitions" : noun_inflections.concat(processDefinition)
	},{
		// word
		"re" : namedRegexp(/\{\{la-adv\|(:<positive>[^|]+)\|(:<comparative>[^|]+)\|(:<comparative_>[^|]*)\|(:<superlative>[^|]+)\|(:<superlative_>[^|]*)\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "adverb", positive : "", comparative : "", superlative : "" },
		"process" : splitDefinitions,
		"definitions" : noun_inflections.concat(processDefinition)
	},{
		// word
		// {{head|la|adverb}}
		"re" : namedRegexp(/\{\{head\|la\|adverb\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "adverb" },
		"process" : splitDefinitions,
		"definitions" : processDefinition
	}],

	"Noun" : [{
		// word
		"re" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<nominative>[^|]+)\|(:<genitive1>[^|]+)\|(:<genitive2>[^|]+)\|(:<gender>(?:m|f|n))\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "noun", nominative : "", genitive1 : "", genitive2 : "", gender : "", declension :"irr" },
		"process" : splitDefinitions,
		"definitions" : noun_inflections.concat(processDefinition)
	},{
		// word
		"re" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<nominative>[^|]+)\|(:<genitive1>[^|]+)\|(:<genitive2>[^|]+)\|(:<gender>(?:m|f|n))\|(:<declension>(?:first|second|third|fourth|fifth))\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "noun", nominative : "", genitive1 : "", genitive2 : "", gender : "", declension :"" },
		"process" : splitDefinitions,
		"definitions" : noun_inflections.concat(processDefinition)
	},{
		// word
		"re" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<nominative>[^|]+)\|(?:\|)?(:<genitive1>[^|]+)\|(:<genitive2>[^|]+)\|(:<gender>(?:m|f|n))\|g2=(:<gender2>(?:m|f|n))\|(:<declension>(?:first|second|third|fourth|fifth))\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "noun", nominative : "", genitive1 : "", genitive2 : "", gender : "", gender2 : "", declension : "" },
		"process" : splitDefinitions,
		"definitions" : noun_inflections.concat(processDefinition)
	},{
		// word
		// {{la-noun|diēs||diēī|m|g2=f|fifth}}
		"re" : namedRegexp(/\{\{(?:la-noun|la-proper noun)\|(:<nominative>[^|]+)\|(?:\|)?(:<genitive1>[^|]+)\|(:<gender>(?:m|f|n))\|g2=(:<gender2>(?:m|f|n))\|(:<declension>(?:first|second|third|fourth|fifth))\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "noun", nominative : "", genitive1 : "", genitive2 : "", gender : "", gender2 : "", declension : "" },
		"process" : splitDefinitions,
		"definitions" : noun_inflections.concat(processDefinition)
	},{
		// word 
		// '''tax''' {{g|m}}
		// '''sapphīre''' {{f}}
		"re" : namedRegexp(/^'''(:<nominative>[^']+)'''\s+\{\{(?:g\|)?(:<gender>(?:m|f|n))\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "noun", nominative : "", gender : "" },
		"process" : splitDefinitions,
		"definitions" : noun_inflections.concat(processDefinition)
	},{
		// inflection
		"re" : namedRegexp(/\{\{la-noun-form(?:\|(:<word>[^}]+))?\}\}\s+(((:<inflections>#[^\n]+) \n)*)/),
		"default" : {},
		"inflections" : noun_inflections
	},{
		// inflection
		// {{head|la|noun form}}
		"re" : namedRegexp(/\{\{head\|la\|noun form\}\}\s+(((:<inflections>#[^\n]+) \n)*)/),
		"default" : {},
		"inflections" : noun_inflections
	}],
	
	"Adjective" : [{
		// word
		// {{la-adj-1&2|cōnsēnsus|consensa|cōnsēnsa|consensum|cōnsēnsum}}\n\n# {{context|rare|lang=la}} [[agreed]] upon\n
		"re" : namedRegexp(/\{\{la-adj-(:<declension>(?:1&2))\|(:<male_>[^|]+)\|(:<female>[^|]+)\|(:<female_>[^|]+)\|(:<neuter>[^|]+)\|(:<neuter_>[^|]+)\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "adjective", declension : "", female : "", neuter : "" },
		"process" : splitDefinitions,
		"definitions" : adjective_inflections.concat(processDefinition)
	},{
		// word
		// {{la-adj-3rd-1E|phoenīx|phoenicis|phoenīcis}}	
		"re" : namedRegexp(/\{\{la-adj-(:<declension>(?:3rd-1E))\|(:<male>[^|]+)\|(:<female>[^|]+)\|(:<neuter>[^|]+)\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "adjective", declension : "", male : "", female : "", neuter : "" },
		"process" : splitDefinitions,
		"definitions" : adjective_inflections.concat(processDefinition)
	},{
		// inflection
		"re" : namedRegexp(/\{\{la-adj-form\|(:<word>[^}]+)\}\}\s+(((:<inflections>#[^\n]+) \n)*)/),
		"default" : {},
		"inflections" : adjective_inflections
	},{
		// inflection
		// {{head|la|adjective form}}\n\n
		"re" : namedRegexp(/\{\{head\|la\|adjective form\}\}\s+(((:<inflections>#[^\n]+) \n)*)/),
		"default" : {},
		"inflections" : adjective_inflections
	},{
		// inflection
		// {{head|la|adjective|comparative of|ante|cat=adjective comparative forms}}
		"re" : namedRegexp(/\{\{head\|la\|comparative of\|(?:<word>[^|]+)\}\}\s+(((:<inflections>#[^\n]+) \n)*)/),
		"process" : deriveComparativeInflections
	}],
	
	/*"Preposition" : [{
		// word
		"re" : namedRegexp(/\{\{head\|la\|preposition(?:\|head=[^}]+)?\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "preposition" },
		"process" : splitDefinitions,
		"definitions" : processDefinition
	}],*/
	
	"Pronoun" : [{
		// word 
		// {{head|la|pronoun|head=mē|personal pronoun}}
		"re" : namedRegexp(/\{\{head\|la\|pronoun\|head=[^|]+\|personal pronoun\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : {},
		"inflections" : pronoun_inflections
	},{
		// inflection
		// {{head|la|pronoun form}}\n\n
		"re" : namedRegexp(/\{\{head\|la\|pronoun form\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : {},
		"inflections" : pronoun_inflections
	},{
		// inflection
		// '''hī'''\n\n
		"re" : namedRegexp(/^'''(:<word>[^']+)'''\s+((:<inflections>#[^\n]+\n)*)/),
		"default" : { },
		"inflections" : pronoun_inflections
	}],
	
	/*"Conjunction" : [{
		// word 
		// '''at'''\n\n# [[but]], [[yet]]
		"re" : namedRegexp(/^'''(:<word>[^']+)'''\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "conjunction", word : "" },
		"process" : splitDefinitions,
		"definitions" : processDefinition
	},{
		// word 
		// {{head|la|conjunction|interrogative|}}
		"re" : namedRegexp(/\{\{head\|la\|conjunction\|(:<pattern>[^|]+)\|\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "conjunction", pattern : "" },
		"process" : splitDefinitions,
		"definitions" : processDefinition
	}],*/
	
	/*"Interjection" : [{
		// word
		// {{la-interj}}
		"re" : namedRegexp(/\{\{la-interj\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "interjection" },
		"process" : splitDefinitions,
		"definitions" : processDefinition
	}],*/
	
	/*"Particle" : [{
		// word
		// {{head|la|particle|head=nōn|negative particle}}
		"re" : namedRegexp(/\{\{head\|la\|particle\|head=(:<word>[^|]+)[^}]+\}\}\s+((:<definitions>#[^\n]+\n)*)/),
		"default" : { type : "word", pos : "particle", word : "" },
		"process" : splitDefinitions,
		"definitions" : processDefinition
	}]*/
};

MacroParser.prototype.setType = function(type){
	this.type = type;
	this.typematchers = this.matchers[this.type];
}

MacroParser.prototype.setText = function(text){
	this.text = text;
}

MacroParser.prototype.setPage = function(page){
	this.page = page;
}

MacroParser.prototype.parse = function(matchers,text,level,result){
	var matches = {}, self = this;
	
	matchers = matchers || this.typematchers;
	level = level || 1;
	result = result || [];
	
	if (this.typematchers === undefined)
		return null;
	
	while (matches !== null){
		matches = null;
		
		for (var i=0; i<matchers.length && matches === null; i++){
			if (typeof(matchers[i]) === "function")
				matchers[i](text,result);
			else if (matchers[i].re === undefined || null !== (matches = matchers[i].re.exec(text || this.text))){
				if (text === undefined && matches !== null && matches.length)
					this.text = this.text.replace(matches[0],"");
				else
					text = text.replace(matches[0],"");
				
				if (matchers[i].on)
					matchers[i].on.call(this,matches);
				
				if (matches !== null && matches.length && matchers[i].default)
					result = processDefaults(matches,matchers[i],result);
				if (matchers[i].process)
					result = matchers[i].process(matches,matchers[i],result);
				
				for (var k in matchers[i]){
					if (matches !== null && matches.length && util.isArray(matchers[i][k]) && util.isArray(matches.captures[k])){
						matches.captures[k].map(function(d){ 
							if (typeof(matchers[i][k]) === "function" && ["process","on"].indexOf(k) === -1)
								return matchers[i][k](d,result);
							else if (util.isArray(matchers[i][k]))
								return self.parse(matchers[i][k],d,level+1,result); 
							else
								return null;
						}).filter(function(r){ 
							return r !== null; 
						});
					}
				}
			}
		}
		
		return result;
	}
	
	return null;
}

function processDefaults(matches,config,resultssofar){
	var defaults = config.default || {}, result = resultssofar;
	
	if (config.property && config.property.length)
		result = {};
	
	for (var k in defaults){
		if (matches.captures[k] && matches.captures[k].length)
			result[k] = matches.captures[k][0];
		else
			result[k] = defaults[k];
	}
	
	if (config.property && config.property.length){
		resultssofar[config.property] = resultssofar[config.property] || [];
		resultssofar[config.property].push(result);
	}
	
	return result;
}

function splitDefinitions(matches,config,resultssofar){
	if (matches.captures.definitions && matches.captures.definitions.length)
		matches.captures.definitions = matches.captures.definitions[0].split("\n");
	
	return resultssofar;
}

function processDefinition(item,resultsofar){
	if (item.search(/# [^\s]+/) === -1)
		return null;
	
	resultsofar.definitions = resultsofar.definitions || [];
	resultsofar.definitions.push(
		item
			.replace(/^# /,"")
			.replace(/\(''([^']+)''\)/g,"($1)")
			.replace(/\[\[(?:#English\|)?([^\]]+)\]\]/g,"$1")
			.replace(/\[\[[^|#]+(#[^|]+)?|([^|]+)\]\]/g,"$1")
			.replace(/\{\{context\|([^|]+)[^\}]+\}\}/g,"($1)")
			.replace(/\{\{gloss|([^|]+)[^\}]+\}\}/g,"~ $1")
			.replace(/\{\{l[\|\/]en\|([^}]+)}}/g,"$1")
	);
	
	return resultsofar;
}

function deriveComparativeInflections(matches,config,resultssofar){
	if (this.page.search(/ior$/) === -1)
		return null
	
	var stem = this.page.replace(/or$/,"");
	var cases = ["nom","voc","acc","gen","dat","abl"];
	var genders = ["m/f","n"];
	var quantities = ["s","p"];
	var endings = { 
		"nom m/f s" : "or",
		"voc m/f s" : "or",
		"acc m/f s" : "orem",
		"gen m/f s" : "oris",
		"dat m/f s" : "ori",
		"abl m/f s" : "ore",
		
		"nom n s" : "us",
		"voc n s" : "us",
		"acc n s" : "us",
		"gen n s" : "oris",
		"dat n s" : "ori",
		"abl n s" : "ore",
		
		"nom m/f s" : "ores",
		"voc m/f s" : "ores",
		"acc m/f s" : "ores",
		"gen m/f s" : "orum",
		"dat m/f s" : "oribus",
		"abl m/f s" : "oribus",
		
		"nom n s" : "ora",
		"voc n s" : "ora",
		"acc n s" : "ora",
		"gen n s" : "orum",
		"dat n s" : "oribus",
		"abl n s" : "oribus"
	};
	
	resultssofar.inflections = resultssofar.inflections || [];
	
	for (var i=0; i<cases.length; i++){
		for (var j=0; j<genders.length; j++){
			for (var k=0; k<genders.length; k++){
				resultssofar.inflections.push({
					type : "inflection",
					pos : "adjective",
					word : matches.capture("word"),
					form : "comparative",
					case : cases[i],
					gender : genders[j],
					quantity : quantities[k],
					inflection : stem + endings[cases[i]+" "+genders[j]+" "+quantities[k]]
				});
			}
		}
	}
}

function addInflection(matches,config,resultssofar){
	if (resultssofar.type && resultssofar.type === "inflection")
		resultssofar.inflection = resultssofar.inflection || this.page;
}