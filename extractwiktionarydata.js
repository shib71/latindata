var program = require('commander');
var fs = require('fs');
var util = require('util');
var path = require('path');
var PageSplitter = require('./lib/wikipagesplitter');
var Filter = require('./lib/filter');
var XMLParser = require('./lib/xmlparser');
var ParseLatinInfo = require('./lib/parselatininfo');
var sprintf = require("sprintf").sprintf;

program.version("0.0.1")
    .option("-e, --extract <file>","Wiktionary extract file")
    .option("-o, --outputdir <file>","Extract output directory")
    .option("-p, --pagefile","Page file template, using sprintf syntax")
    .parse(process.argv);

program.pagefile = program.pagefile || "page_%s.txt";

var tenses = [];

var misfireLog = fs.createWriteStream(path.join(program.outputdir,"misfire.log"),{ encoding:"utf8" });
var processedLog = fs.createWriteStream(path.join(program.outputdir,"processed.log"),{ encoding:"utf8" });
var count = 0, sections = [], words = fs.createReadStream(program.extract,{ encoding:"utf8" })
	.pipe(new PageSplitter())
	.pipe(new Filter(function(page){ return page.search(/(^|[^=])==Latin==[^=]/i) > -1 }))
	.pipe(new XMLParser())
	.pipe(new Filter(function(result){ return result.page.title[0].search(/^\w+$/) > -1}))
	.pipe(new ParseLatinInfo())
	.on("misfire",function(info){
		if (["fabella","y","be","comma","Syria","Jupiter","Macedonia","el","pupa","anterior","Abdera","er"].indexOf(info.page)===-1 && ["word"].indexOf(info.type)===-1) 
			console.log(JSON.stringify(info));
		
		misfireLog.write(JSON.stringify(info)+"\n");
	})
	.on("readable",function(){
		var page = {};
		
		while (null !== (page = this.read())){if (page.words.length && page.words[0].tense && tenses.indexOf(page.words[0].tense > -1)) tenses.push(page.words[0].tense);
			count += 1;
			
			processedLog.write(sprintf(
				"%20s: %3s words, %3s inflections\n",
				page.word,
				page.words.length, 
				page.inflections.length
			));
			
			console.log(sprintf(
				"%20s: %3s words, %3s inflections",
				page.word,
				page.words.length, 
				page.inflections.length
			));
		}
	})
	.on("end",function(){
		console.log("parsed "+count+" pages");
		console.log("found sections: "+sections.join(", "));
		misfireLog.end();
		processedLog.end();
	});