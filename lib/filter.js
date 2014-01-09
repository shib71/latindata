var Transform = require('stream').Transform;
var util = require('util');

module.exports = Filter = function(fn,opt){
	if (!(this instanceof Filter))
		return new Filter(fn,opt);
	
	opt = opt || {};
	opt.objectMode = true;
	
	Transform.call(this,opt);
	
	this._soFar = "";
	this._inPage = false;
	this._fn = fn;
};
util.inherits(Filter,Transform);

Filter.prototype._transform = function(chunk, encoding, done){
	if (this._fn(chunk))
		this.push(chunk);
	
	done();
};