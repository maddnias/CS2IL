var express = require('express');
var app = express();
var hbs = require('hbs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;
var fs = require('fs');
var execSync = require('exec-sync');

app.enable('trust proxy');
app.set('views', __dirname + '/views/');
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/index', function(req, res) {
	res.render("index.html");
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
		        var output = execSync("./files/CS2ILHelper.exe ./files/test ./files/tmp123.exe");
		    	res.render('paste.html', { cscode: req.body.txtCode, ilcode: output});
		    }
		}); 
	});
});


app.listen(8080);