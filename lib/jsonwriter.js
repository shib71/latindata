var Transform = require('stream').Transform;
var util = require('util');

module.exports = JSONWriter = function(opt){
	if (!(this instanceof JSONWriter))
		return new JSONWriter(opt);
	
	opt = opt || {};
	this.open = opt.open || "[\n";
	this.seperator = ",\n";
	this.close = opt.close || "\n]\n";
	
	this.outputedOpen = false;
	this.outputedEnd = false;
	
	Transform.call(this,{ objectMode : true });
	
	this.on("end",this.onEnd);
};
util.inherits(JSONWriter,Transform);

JSONWriter.prototype._transform = function(chunk, encoding, done){
	if (this.outputedClose){
		done();
		return;
	}
	
	if (this.outputedOpen){
		this.push(this.seperator);
	}
	else{
		this.push(this.open)
		this.outputedOpen = true;
	}
	this.push(JSON.stringify(chunk));
	done();
}

JSONWriter.prototype.onEnd = function(){
	if (!this.outputedClose){
		this.push(this.close);
		this.outputedClose = true;
	}
}