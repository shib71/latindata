var util = require("util");
var Transform = require('stream').Transform;
var namedRegexp = require('named-regexp').named;

module.exports = Base = function(opt){
	if (!(this instanceof Base))
		return new Base(opt);
	
	opt = opt || {};
	opt.objectMode = true;
	
	Transform.call(this,opt);
};
util.inherits(Base,Transform);

Base.prototype.matches = [];

Base.prototype._transform = function(chunk, encoding, done){
	
	
	
	done();
};