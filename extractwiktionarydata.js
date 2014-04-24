var program = require('commander');
var fs = require('fs');
var util = require('util');
var path = require('path');
var CommandReadable = require("./lib/commandreadable.js");
var PageSplitter = require('./lib/wikipagesplitter');
var Filter = require('./lib/filter');
var XMLParser = require('./lib/xmlparser');
var ParseLatinInfo = require('./lib/parselatininfo');
var JSONWriter = require("./lib/jsonwriter");
var sprintf = require("sprintf").sprintf;
var colors = require("colors");

program.version("0.0.1")
    .option("-e, --extract <file>","Wiktionary extract file")
    .option("-o, --outputdir <file>","Extract output directory")
    .option("-p, --pagefile","Page file template, using sprintf syntax")
    .parse(process.argv);

program.pagefile = program.pagefile || "page_%s.txt";

var tenses = [];

var misfireLog = fs.createWriteStream(path.join(program.outputdir,"misfire.log"),{ encoding:"utf8" });
var processedLog = fs.createWriteStream(path.join(program.outputdir,"processed.log"),{ encoding:"utf8" });
var processedData = fs.createWriteStream(path.join(program.outputdir,"wiktionary_data.json"),{ encoding:"utf8" });
var count = 0, file = "";

if (program.extract.search(/\.7z$/) > -1)
	file = fs.createReadStream(program.extract,{ encoding:"utf8" });
else
	file = new CommandReadable({ debug:true, command:"7z", args:["e","-so",program.extract] });

var words = file
	.pipe(new PageSplitter())
	.pipe(new Filter(function(page){ return page.search(/(^|[^=])==Latin==[^=]/i) > -1 }))
	.pipe(new XMLParser())
	.pipe(new Filter(function(result){ return result.page.title[0].search(/^\w+$/) > -1}))
	.pipe(new ParseLatinInfo())
	.on("misfire",function(info){
		if (info.type === "word"){
			console.log(sprintf(
				"           %20s %15s %14s %3s",
				info.word,
				"N/A", 
				info.subsection.toLowerCase(), 
				0
			).red);
			console.log(info.text);
			file.close();
		}
		if (info.type === "definition"){
			console.log(sprintf(
				"           %20s %15s %14s %3s",
				info.word,
				info.results.pos, 
				info.results.type, 
				info.results.definitions ? info.results.definitions.length : 0
			).red);
			console.log(info.history);
			file.close();
		}
		if (false && info.type === "subsection"){
			console.log(sprintf(
				"           %20s %15s %14s %3s",
				info.word,
				"N/A", 
				info.subsection.toLowerCase(), 
				0
			).red);
			console.log(info.text);
			file.close();
		}
	})
	.on("word",function(item){
		console.log(sprintf(
			"%10s %20s %15s %14s %3s",
			++count,
			item.word,
			item.pos, 
			item.type,
			item.definitions ? item.definitions.length : 0
		));
	})
	.pipe(new JSONWriter())
	.pipe(processedData);

file.on("close",function(){
	console.log("parsed "+count+" words");
	processedData.write("\n]\n");
	
	misfireLog.end();
	processedLog.end();
	processedData.end();
});