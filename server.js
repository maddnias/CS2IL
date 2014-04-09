var express = require('express');
var app = express();
var hbs = require('hbs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;
var fs = require('fs');
var execSync = require('exec-sync');
var endOfLine = require('os').EOL;

app.enable('trust proxy');
app.set('views', __dirname + '/views/');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/index', function(req, res) {
	res.render("index.html");
});

app.get('/', function(req, res) {
	res.redirect('/index');
});

var d = require('domain').create();

d.on('error', function(err) {
	console.log(err);
});

app.post('/index', function(req, res){
	d.run(function() {
		fs.writeFile("./files/test", req.body.txtReferences + '---CODE---' + req.body.txtCode, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		        var output = JSON.parse(execSync("./files/CS2ILHelper.exe ./files/test ./files/tmp123.exe " + req.body.version + " " + req.body.cbComments));

		        var disasm = output["Disassembly"].substring(1, output["Disassembly"].length-1);
		        disasm = disasm.split('\\n');
				var codeMap = output["CodeMap"];
				var source = req.body.txtCode.split(endOfLine);

				var codeBlocks = [];
				var ilBlocks = [];
				var codeMaps = [];

				for(var i = 0;i < source.length;i++) {
					codeBlocks.push({index: i, block:source[i]});
				}

				for(var i = 0;i < disasm.length;i++) {
					ilBlocks.push({index: i, block:disasm[i].split('|')[0].replace("\\t", "\t"), ilidx: disasm[i].split('|')[1]});
				}

				for(var i = 1, x = 1;i < codeMap.split('_').length;i+=2,x++) {
					codeMaps.push({line:codeMap.split('_')[i], indexes: codeMap.split('_')[i+1].split('|')[1].replace('"', '')});
				}

		    	res.render('paste.html', { cscode: codeBlocks, ilcode: ilBlocks, codemaps: codeMaps});
		    	var ip = req.headers['x-forwarded-for'] || 
    					req.connection.remoteAddress || 
     					req.socket.remoteAddress ||
     					req.connection.socket.remoteAddress;
		    	fs.appendFile('log.txt', ip + ' just compiled a file!\r\n', function (err) {
				});
		    }
		}); 
	});
});


app.listen(8080);