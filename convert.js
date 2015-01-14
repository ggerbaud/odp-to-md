var fs = require('fs');
var sax = require("sax");
var AdmZip = require('adm-zip');

var argv = require('minimist')(process.argv.slice(2));

if (!argv["f"]) {
	console.log("no file, use -f argument");
	process.exit(1);
}

var filePath =argv["f"];
git 
if (!fs.existsSync(filePath)) {
	console.log("file not found", filePath);
	process.exit(1);
}

var zip = new AdmZip(filePath);
var zipEntries = zip.getEntries();
zipEntries.forEach(function(val) {
	if (val.entryName.indexOf("content.xml") >= 0 || val.entryName.indexOf("Pictures") >=0 ) {
		console.log(val.entryName);
		zip.extractEntryTo(val, ".tmp/", true, true);
	}
})
//return;
//zip.extractEntryTo("content.xml", ".tmp/", true, true);

function MDWriter() {
	this.text = "";

	this.addPage = function() {
		this.text+= "\n\n****\n\n";
	}

	this.addParagraph = function() {
		this.text+= "\n";
	}

	this.addText = function(text) {	
		this.text+=text;
	}

	this.addImage = function(path) {
		this.text+="\n![]("+path+")\n";
	}
}

var mdWriter = new MDWriter();

var saxStream = sax.createStream(true, {
            trim: true,
            normalize: true,
            xmlns: false,
            lowercase: true
        });

saxStream.on("opentag", function(node) {
	//console.log(node.name);
	if (node.name === "text:p") {
		mdWriter.addParagraph();
	} else if (node.name === "draw:page") {
		mdWriter.addPage();
	} else if (node.name ==="draw:image") {
		mdWriter.addImage(node.attributes["xlink:href"]);
	}
});

saxStream.on("end", function() {
	//console.log(mdWriter.text);
	fs.writeFile(".tmp/content.md", mdWriter.text);
});

saxStream.on("text", function(t) {
    mdWriter.addText(t);
});

fs.createReadStream(".tmp/content.xml").pipe(saxStream);

