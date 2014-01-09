var StateMachine = require("./base");
var util = require("util");

module.exports = VerbSM = function(initVal){
	if (!(this instanceof VerbSM))
		return new VerbSM(opt);
	
	StateMachine.apply(this,arguments);
	
}
util.inherits(VerbSM,StateMachine);

VerbSM.prototype.states = {
	'*' : {
		next : [ "macro" ]
	},
	'macro' : {
		next : [ "present_active" ],
		test : function(oldstate,newval){ return newval==="la-verb"; }
	},
	'present_active' : {
		next : [ "present_active_macron" ]
	},
	'present_active_macron' : {
		next : [ "present_infinitive" ]
	},
	'present_infinitive' : {
		next : [ "present_infinitive_macron" ]
	},
	'present_infinitive_macron' : {
		next : [ "perfect_active" ]
	},
	'perfect_active' : {
		next : [ "perfect_active_macron" ]
	},
	'perfect_active_macron' : {
		next : [ "pattern_nosupine", "supine" ]
	},
	'pattern_nosupine' : {
		next : [ "alternate_present_infinitive" ],
		test : function(oldstate,newvalue){ return newvalue.search(/^pattern=\[\[(irregular|irregular verb|passive)\]\]$/) > -1; }
	},
	'supine' : {
		next : [ "supine_macron" ]
	},
	'supine_macron' : {
		next : [ "pattern", "alternate_present_infinitive" ]
	},
	'pattern' : {
		next : [ "alternate_present_infinitive", "future_participle" ],
		test : function(oldstate,newvalue){ return newvalue.search(/^pattern=\[\[(irregular|irregular verb|passive)\]\]$/) > -1; }
	},
	'alternate_present_infinitive' : {
		next : [ "alternate_present_infinitive_macron" ]
	},
	'alternate_present_infinitive_macron' : {
		next : []
	},
	'future_participle' : {
		next : [],
		test : function(oldstate,newvalue){ return newvalue.search(/44=future participle/) > -1; }
	}
}