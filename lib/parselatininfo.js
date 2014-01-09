var Transform = require('stream').Transform;
var util = require('util');
var VerbSM = require("./sm/verb");
var MacroParser = require('./macroparser');

module.exports = ParseLatinInfo = function(opt){
	if (!(this instanceof ParseLatinInfo))
		return new ParseLatinInfo(opt);
	
	opt = opt || {};
	opt.objectMode = true;
	
	Transform.call(this,opt);
};
util.inherits(ParseLatinInfo,Transform);

ParseLatinInfo.prototype._transform = function(chunk, encoding, done){
	var parser = {}, info = {}, ping = false, result = {
		id : chunk.page.id[0],
		word : chunk.page.title[0],
		subsections : this.extractSubsections(chunk.page.revision[0].text[0]._,chunk.page.title[0]==="liberi"),
		words : [],
		inflections : []
	};
	
	for (var k in result.subsections){
		if (this["parse"+k.replace(/[^\w]/g,"")] !== undefined){
			this["parse"+k.replace(/[^\w]/g,"")](result.subsections[k],result);
		}
		else {
			ping = false, parser = MacroParser(k,result.subsections[k].Intro,result.word);
			
			while (null !== (info = parser.parse())){
				ping = true;
				
				if (info.inflections && info.inflections.length){
					result.inflections = result.inflections.concat(info.inflections);
					delete info.inflections;
				}
				
				if (info.type && info.type === "inflection")
					result.inflections.push(info);
				else if (info.type && info.type === "word")
					result.words.push(info);
			}
			
			if (ping === false)
				this.emit("misfire",{ type:"subsection", page:result.word, subsection:k, data:result.subsections[k] })
		}
	}
	
	if (result.words.length === 0 && result.inflections.length === 0)
		this.emit("misfire",{ type:"word", word:result });
	else if (result.words.length || result.inflections.length)
		this.push(result);
	
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