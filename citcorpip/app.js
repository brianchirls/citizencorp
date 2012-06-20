
/**
 * Module dependencies.
 */

var express = require('express'),
	restler = require('restler');

var app = module.exports = express.createServer();

var ipCache = {}, addresses = [];

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

function getIp(ip, next) {
	var i;
	i = addresses.indexOf(ip);
	if (i >= 0) {
		addresses.splice(i, 1);
		addresses.push(ip);
		next(ipCache[ip]);
		console.log(ip + ' from cache');
		return;
	}

	restler.get('http://freegeoip.net/json/' + ip).on('complete', function (result) {
		console.log('got remote data for ' + ip);
		if (addresses.length > 1000) {
			i = addresses.shift();
			delete ipCache[i];
		}

		addresses.push(ip);
		ipCache[ip] = result;
		next(result);
	});
}

// Routes

app.get('/', function(req, res, next) {
	var ip,
		callback = req.query.callback;
	function hazIp(data) {
		if (callback) {
			res.send('window[' + JSON.stringify(callback) + '](' +
				JSON.stringify(data) + ');', {'Content-Type': 'application/javascript'});
		} else {
			res.send(JSON.stringify(data, null, 4), {'Content-Type': 'application/json'});
		}
	}

	ip = req.header['x-forwarded-for'];
	if (ip) {
		ip = ip.split(',');
		ip = ip && ip[0];
		console.log('ip address from proxy header: ' + ip);
	}

	if (!ip) {
		ip = req.connection.remoteAddress;
		console.log('ip address connection.remoteAddress: ' + ip);
	}

	ip = ip && ip.trim();
	if (ip === '127.0.0.1') {
		ip = '208.76.113.2';
	} else {
		console.log(ip);
	}

	if (!ip) {
		console.log('no ip address found');
		hazIp({});
		return;
	}

	getIp(ip, hazIp);
});

app.listen(3000, function(){
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
