var base = require("./base");
var util = require("util");

module.exports = PrepositionParser = function(opts){
	if (!(this instanceof PrepositionParser))
		return new PrepositionParser(opt);
	
	base.call(this,opt);
};
util.inherits(PrepositionParser,base);

PrepositionParser.prototype.matchers = [{
	// word
	"re" : namedRegexp(/\{\{head\|la\|preposition(?:\|head=[^}]+)?\}\}\s+((:<definitions>#[^\n]+\n)*)/),
	"default" : { type : "word", pos : "preposition" },
	"process" : splitDefinitions,
	"definitions" : processDefinition
}];