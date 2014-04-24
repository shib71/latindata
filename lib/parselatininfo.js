var Transform = require('stream').Transform;
var util = require('util');
var sprintf = require("sprintf").sprintf;

module.exports = ParseLatinInfo = function(opt){
	if (!(this instanceof ParseLatinInfo))
		return new ParseLatinInfo(opt);
	
	opt = opt || {};
	opt.objectMode = true;
	
	this.setupParsers();

	Transform.call(this,opt);
};
util.inherits(ParseLatinInfo,Transform);

ParseLatinInfo.prototype.setupParsers = function(){
	var self = this;
	var hasNoWord = [
		"eorum", "sapphire", "abolla", "alas", "mare", "acalephae", "area", "antenna", "ursa", "agricola", "bestia",
		"bestiola", "seraphin", "vademecum", "mender"
		//,"ecquid","ecqui","ecquae","eccuius","ecquorum","ecquarum","eccui","ecquibus","ecquem","ecquam","ecquas",
		//"ecqua"
	];
	var hasNoDef = [
		"Virginia"
	];
	
	this.parsers = {
		"Preposition" : new require("./sm/preposition")(),
		"Conjunction" : new require("./sm/conjunction")(),
		"Interjection" : new require("./sm/interjection")(),
		"Particle" : new require("./sm/particle")(),
		"Pronoun" : new require("./sm/pronoun")(),
		"Noun" : new require("./sm/noun.js")(),
		"Adverb" : new require("./sm/adverb.js")(),
		"Verb" : new require("./sm/verb.js")()
	}

	// set up parsers
	for (var k in this.parsers){
		this.parsers[k].on("done",function(history){
			if (history.length === 0 && hasNoWord.indexOf(this.meta.word) === -1){
				self.emit("misfire",{ type:"word", word:this.meta.word, text:this.text, subsection:this.meta.subsection, history:history });
			}
			else {
				var results = [];
				for (var i=0; i<history.length; i++){
					if (history[i].results){
						if (util.isArray(history[i].results) && history[i].results.length)
							results = results.concat(history[i].results);
						else
							results.push(history[i].results);
					}
				}
					
				for (var i=0; i<results.length; i++){
					results[i].word = results[i].word || this.meta.word;
					results[i].definitions = results[i].definitions || [];
					if (results[i].declension) results[i].declension = results[i].declension.toLowerCase();
					
					if (results[i].type === "word" && results[i].definitions.length === 0){
						if (hasNoWord.indexOf(this.meta.word) === -1 && hasNoDef.indexOf(this.meta.word) === -1 && (i + 1 === results.length || results[i+1].type !== "inflection")){
							self.emit("misfire",{ type:"definition", word:this.meta.word, text:this.text, results:results[i], history:history });
						}
						if (hasNoWord.indexOf(this.meta.word) === -1 && (i + 1 === results.length || results[i+1].type !== "inflection")){
							self.push(results[i]);
							self.emit("word",results[i]);
						}
					}
					else{
						self.push(results[i]);
						self.emit("word",results[i]);
					}
				}
			}
		});
	}
}

ParseLatinInfo.prototype._transform = function(chunk, encoding, done){
	var parser = {}, info = {}, ping = false, subsection = "", result = {
		id : chunk.page.id[0],
		word : chunk.page.title[0],
		subsections : this.extractSubsections(chunk.page.revision[0].text[0]._,chunk.page.title[0]==="liberi"),
		words : [],
		inflections : []
	};
	
	for (var k in result.subsections){
		subsection = k.replace(/[^\w]/g,"");
		
		if (this["parse"+subsection] !== undefined){
			this["parse"+subsection](result.subsections[k],result);
		}
		else if (this.parsers[subsection] !== undefined){
			this.parsers[subsection].process(result.subsections[k].Intro,{ word:result.word, subsection:k });
		}
		else{
			this.emit("misfire",{ type:"subsection", word:result.word, text:result.subsections[k].Intro, subsection:k });
		}
	}
	
	done();
};

ParseLatinInfo.prototype.extractSubsections = function(text,debug){
	var text = text.slice(text.search(/(^|[^=])==Latin==[^=]/i)+10), next = text.search(/[^=]==[^=]/), result = {};
	
	if (next > -1)
		text = text.slice(0,next)
	
	text = text.replace(/(^\s+|\s+$)/g,"");
	
	return this.parseSubsections(text,3);
}

ParseLatinInfo.prototype.parseSubsections = function(text, level){
	var headingstart = -1, textstart = -1, heading = "", subsections = {
		Intro : ""
	};
	var eq = new Array(level+1).join("=");
	var gt = new Array(level+2).join("=");
	var trimReplace = /(^\s+|\s+$)/g;
	var headingSearch = new RegExp("(^|\n)"+eq+"[^=]+"+eq);
	var headingMatch = new RegExp("^\n?"+eq+"([^=]+)"+eq);
	var headingReplace = new RegExp("^\n?"+eq+"[^=]+"+eq);
	var subheadingSearch = new RegExp("(^|\n)"+gt+"[^=]+"+gt);
	
	while (text.length){
		headingstart = text.search(headingSearch);
		
		if (headingstart === -1){
			subsections.Intro += text;
			text = "";
		}
		else {
			if (headingstart > 0) {
				subsections.Intro += text.slice(0,headingstart);
				text = text.slice(headingstart).replace(trimReplace,"");
			}
			
			heading = text.match(headingMatch)[1]
				.replace(/\{\{abbreviation-old\|la\}\}/g,"Abbreviation")
				.replace(/\{\{initialism-old\|la\}\}/g,"Abbreviation")
				.replace(/^Proper noun$/,"Noun");
			text = text.replace(headingReplace,"").replace(trimReplace,"");
			
			headingstart = text.search(headingSearch);
			if (headingstart > -1){
				subsections[heading] = text.slice(0,headingstart);
				text = text.slice(headingstart).replace(trimReplace,"");
			}
			else {
				subsections[heading] = text;
				text = "";
			}
			
			if (subsections[heading].search(subheadingSearch) > -1 || level <= 3)
				subsections[heading] = this.parseSubsections(subsections[heading],level+1);
		}
	}
	
	return subsections;
}

ParseLatinInfo.prototype.parseIntro = function(word,meta){
	
};

ParseLatinInfo.prototype.parseEtymology = function(word,meta){
	
};

ParseLatinInfo.prototype.parseEtymology1 = function(word,meta){
	
};

ParseLatinInfo.prototype.parseEtymology2 = function(word,meta){
	
};

ParseLatinInfo.prototype.parseEtymology3 = function(word,meta){
	
};

ParseLatinInfo.prototype.parseReferences = function(word,meta){
	
};

ParseLatinInfo.prototype.parsePronunciation = function(word,meta){
	
};

ParseLatinInfo.prototype.parseAlternativeforms = function(word,meta){
	
};

ParseLatinInfo.prototype.parseLetter = function(word,meta){
	
};

ParseLatinInfo.prototype.parseQuotations = function(word,meta){
	
};

ParseLatinInfo.prototype.parseAbbreviation = function(word,meta){
	
};

ParseLatinInfo.prototype.parsePhrase = function(word,meta){
	
};

ParseLatinInfo.prototype.parseUsagenotes = function(word,meta){
	
};