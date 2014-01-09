var Transform = require('stream').Transform;
var util = require('util');

module.exports = PageReader = function(opt){
	if (!(this instanceof PageReader))
		return new PageReader(opt);
	
	opt = opt || {};
	opt.objectMode = true;
	
	Transform.call(this,opt);
	
	this._soFar = "";
	this._inPage = false;
};
util.inherits(PageReader,Transform);

PageReader.prototype._transform = function(chunk, encoding, done){
	var start = -1, finish = -1;
	
	this._soFar += chunk;
	
	while ((start = this._soFar.search(/<page>/)) > -1 && (finish = this._soFar.search(/<\/page>/)) > -1){
		this.push(this._soFar.slice(start,finish+7));
		this._soFar = this._soFar.slice(finish+7);
	}
	
	done();
};
PageReader.prototype._flush = function(done){
	console.log("done reading");
	done();
}