var util = require("util");

module.exports = function processDefinition(info){//console.log(info.matches[0],info.matches[0].search(/^# (\w|\[|\{\{context|\{\{gloss|\{\{l\|)/));
	if (info.matches && info.matches[0] && info.matches[0].search(/^#\s*(\w|\[|'|"|\(|\{\{label|\{\{diminutive of|\{\{context|\{\{gloss|\{\{praenomen|\{\{alternative|\{\{qualifier|\{\{non-gloss definition|\{\{medieval spelling of|\{\{given name|\{\{alternative spelling of|\{\{senseid|\{\{cx|\{\{l[\/|])/) === -1)
		return null;
	
	var match = info.matches.captures.definition ? info.matches.capture("definition") : info.matches[0];
	var state = null, index = -1;
	var definition = info.matches[0]
		.replace(/^#\s*/,"")
		.replace(/'''([^']+)'''/g,"'$1")
		.replace(/\(''([^']+)''\)/g,"(*$1*)")
		.replace(/''([^']+)''/g,"*$1*")
		.replace(/\[\[(?:#English\|)?([^\]]+)\]\]/g,"$1")
		.replace(/\[\[[^|#]+(#[^|]+)?|([^|]+)\]\]/g,"$1")
		.replace(/\[\[[^|#\]]+\]\]/g,"$1")
		.replace(/\{\{medieval spelling of\|([^|}\n]+)\|[^|}\n]+\|lang=Latin\}\}/g,"medieval spelling of $1")
		.replace(/\{\{context\|([^|]+)[^\}]+\}\}/g,"($1)")
		.replace(/\{\{context\|([^|}]+)\|([^|}]+)\|lang=la\}\}/g,"$1/$2 ~")
		.replace(/\{\{gloss|([^|]+)[^\}]+\}[^\}]*\}/g,"~ $1")
		.replace(/\{\{alternative form of\|([^|])+\|lang=la\}\}/g,"alternative form of $1")
		.replace(/\{\{qualifier\|([^|}]+)\}\}/g,"($1)")
		.replace(/\{\{praenomen(\|[^|}]+)?\}\}/g,"proper noun")
		.replace(/\{\{given name\|(male|female)\|lang=la\}\}/g,"$1 name")
		.replace(/\{\{alternative spelling of\|([^|}\n]+)\|lang=la\}\}/g,"alternative spelling of $1")
		.replace(/\{\{label\|la\|([^|}]+)\}\}/g,"($1)")
		.replace(/\{\{senseid\|la\|[^|}\n]+\}\}/g,"")
		.replace(/\{\{diminutive of\|([|}\n]+)\|lang=la\}\}/g,"diminutive of $1")
		.replace(/\{\{l[\/|]en\|([^}]+)}}/g,"$1")
		.replace(/\{\{l[\/|]la\|([^|}]+)\}\}/g,"$1")
		.replace(/\{\{cx\|([^|}\n]+)\|lang=la\}\}/g,"($1)")
		.replace(/\{\{non-gloss definition|([^}|]+)\}\}/g,"$1")
		.replace(/(^\s+|\s+$)/g,"");
	
	for (var i=this.stateHistory.length-1; i>=0; i--){
		if (this.stateHistory[i].results && (util.isArray(this.stateHistory[i].results) || this.stateHistory[i].results.type === "word")){
			state = this.stateHistory[i];
			index = -1;
		}
	}
	
	if (state === null)
		return;
	
	if (util.isArray(state.results)){
		for (var i=0; i<state.results.length; i++){
			if (state.results[i].type === "word"){
				state.results[i].definitions = state.results[i].definitions || [];
				state.results[i].definitions.push(definition);
			}
		}
	}
	else {
		state.results.definitions = state.results.definitions || [];
		state.results.definitions.push(definition);
	}
	
	this.emit("redact",state,index);
}