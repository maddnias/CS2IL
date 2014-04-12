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


app.get('/cs2il', function(req, res) {
	res.render("index.html");
});

app.get('/', function(req, res) {
	res.redirect('/cs2il');
});

var d = require('domain').create();

d.on('error', function(err) {
	//i know..
	console.log(err);
});

app.post('/index', function(req, res){
	d.run(function() {
		fs.writeFile("./files/test", req.body.txtReferences + '---CODE---' + req.body.txtCode, function(err) {
		    if(err) {
		        console.log(err);
		    } else {
		    	var comments = req.body.cbComments == "on";

		    	if(req.body.version[0] != "2" &&
		    		req.body.version[0] != "3" &&
		    		req.body.version[0] != "4")
		    		res.send('Invalid data');

		    	if(req.body.version[1] != "0" &&
		    		req.body.version[1] != "5")
		    		res.send('Invalid data');

		    	if(req.body.version.length != 2)
		    		res.send('Invalid data');

		        var output = JSON.parse(execSync("./files/CS2ILHelper.exe ./files/test ./files/tmp123.exe " + req.body.version + " " + (comments ? "on" : "off")));

		        if(output["Errors"].length != 0) {
		        	res.render('paste.html', { "cscode" : output["Errors"]});
		        }

		        var source = req.body.txtCode.split(endOfLine);
		        var codeBlocks = [];

				for(var i = 0;i < source.length;i++) {
					codeBlocks.push({
						index: i,
						block:source[i]
					});
				}

		        res.render('paste.html', {
		        							"cscode" : codeBlocks,
		        							"ilcode" : output['Disassembly'],
		        							"codemap" : output['CodeMap'] 
		        						 });
		    }
		}); 
	});
});


app.listen(8080);