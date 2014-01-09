var Transform = require('stream').Transform;
var util = require('util');
var xml2js = require('xml2js');

module.exports = XMLParser = function(opt){
	if (!(this instanceof XMLParser))
		return new XMLParser(opt);
	
	opt = opt || {};
	opt.objectMode = true;
	
	Transform.call(this,opt);
};
util.inherits(XMLParser,Transform);

XMLParser.prototype._transform = function(chunk, encoding, done){
	var self = this;
	
	xml2js.parseString(chunk,function(err,result){
		if (err === null)
			self.push(result);
		
		done();
	});
};