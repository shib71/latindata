{
	// inflection
	// # {{inflection of|hic||nom|m|p|lang=la}}
	group : "inflections", property : "inflections",
	re : namedRegexp(/\{\{(?:inflection of|inflected form of)\|(:<word>[^|]+)\|\|(:<case>nom|voc|acc|gen|dat|abl)\|(:<gender>m|f|n)\|(:<quantity>s|p)\|lang=la(?:\|nodot=1)?\}\}/),
	default : { type : "inflection", pos : "pronoun", word : "", "case" : "", gender : "", quantity : "" },
	process : addInflection
}


InflectionParser.prototype.parse = function(handledefaults){
	
}

var base = require("./base");
var util = require("util");

module.exports = InflectionParser = function(opts){
	if (!(this instanceof InflectionParser))
		return new InflectionParser(opt);
	
	base.call(this,opt);
};
util.inherits(InflectionParser,base);

InflectionParser.prototype.getDefinition = function(){
	if (this.text.search(/# [^\s]+/) === -1)
		return null;
	
	return this.text
			.replace(/^# /,"")
			.replace(/\(''([^']+)''\)/g,"($1)")
			.replace(/\[\[(?:#English\|)?([^\]]+)\]\]/g,"$1")
			.replace(/\[\[[^|#]+(#[^|]+)?|([^|]+)\]\]/g,"$1")
			.replace(/\{\{context\|([^|]+)[^\}]+\}\}/g,"($1)")
			.replace(/\{\{gloss|([^|]+)[^\}]+\}\}/g,"~ $1")
			.replace(/\{\{l[\|\/]en\|([^}]+)}}/g,"$1")
	);
}
