var events = require("events");
var util = require("util");

module.exports = StateMachine = function(initialValue){
	if (!(this instanceof StateMachine))
		return new StateMachine(initialValue);
	
	events.EventEmitter.apply(this);
	
	var self = this;
	
	if (this.states["*"] === undefined)
		throw new Error("No empty state '*' has been defined");
	
	for (var k in this.states){
		if (this.states[k].test === undefined)
			this.states[k].test = this.returnTrue;
		
		if (this.states[k].next === undefined)
			this.states[k].next = [];
		
		this.states[k].next = this.states[k].next.filter(function(n){ return self.states[n] !== undefined; });
	}
	
	this.state = "*";
	this.value = undefined;
	
	if (initialValue)
		this.setValue(initialValue);
}
util.inherits(StateMachine,events.EventEmitter);

StateMachine.prototype.states = {};

StateMachine.prototype.setValue = function(value){
	var cur = this.states[this.state];
	
	for (var i=0; i<cur.next.length; i++){
		if (this.states[cur.next[i]].test(value)){
			this.emit("exit",{ state : this.state, value : this.value });
			this.state = cur.next[i];
			this.value = value;
			this.emit("enter",{ state : this.state, value : this.value });
			this.emit(this.state,this.value);
			return;
		}
	}
	
	throw new Error("Value ["+value+"] is not valid after state ["+this.state+"]");
}