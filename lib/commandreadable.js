var Readable = require('stream').Readable;
var util = require('util');
var spawn = require('child_process').spawn;

module.exports = CommandReadable = function(opt){
	if (!(this instanceof CommandReadable))
		return new CommandReadable(opt);
	
	opt = opt || {};

	this.debug = opt.debug || false;

	this.command = spawn(opt.command,opt.args);
	this.command.stdout.pipe(this);
	this.command.stderr.on('data', this.onCommandError.bind(this));
	this.command.on('close', this.onCommandClose.bind(this));
	
	this.error = "";

	Readable.call(this,opt);
};
util.inherits(CommandReadable,Readable);

CommandReadable.prototype.onCommandError = function (data) {
	this.error += data;
	if (this.debug)
		console.log('command stderr: ' + data);
}

CommandReadable.prototype.onCommandClose = function (code) {
	if (code !== 0 && this.debug) {
		console.log('grep process exited with code ' + code);
	}
	this.end();
};

