// cast-aws-proxy
// main.js
// julian lepinski 2015

if (!process.env.PORT){
	var localConfig = require("./.local-config.json");
	for (var i in localConfig) process.env[i] = localConfig[i];
}

console.log("");
console.log("[init] cast-aws-proxy starting up...");

var http			= require("http");
var express			= require("express");
var request			= require("request");

var app				= express();
var targetURI		= process.env.ORIGIN_URI;
var forceOverwite	= process.env.OVERWRITE_EXISTING ? true : false;
var forcedHeaders	= require("./forced-headers.json");
var verboseLogging	= process.env.VERBOSE_LOGS ? true : false;
var remoteHeaders	= process.env.REMOTE_FORCED_HEADERS ? true : false;

if (!targetURI) {
	console.log("[error] no ORIGIN_URI present");
	process.exit(1);
}

if (remoteHeaders && process.env.REMOTE_FORCED_HEADERS.trim() !== "") {
	var remoteHeaderURL = process.env.REMOTE_FORCED_HEADERS;
	console.log("[config] loading remote headers from " + remoteHeaderURL);
	request(remoteHeaderURL, function (error, response, body) {
		if (error) {
			console.log("[error] there was a problem getting remote headers: " + error);
			process.exit(1);
		} else if (response && response.statusCode === 200) {
			try {
				forcedHeaders = JSON.parse(body);
				console.log("[config] remote headers loaded");
				completeAsyncStartup();
			} catch (e) {
				console.log("[error] there was a problem parsing the remote headers: " + e);
				process.exit(1);
			}
		} else {
			console.log("[error] there was an unspecified problem getting the remote headers");
			process.exit(1);
		}
	});
} else {
	completeAsyncStartup();
}

app.get("*", function (req, res) {
	verboseLog("[" + req.url + "] proxying request to " + targetURI + req.url);
	request(targetURI + req.url).pipe(res);

	res.oldWriteHead = res.writeHead;
	res.writeHead = function(statusCode, reasonPhrase, headers) {
		for (headerKey in forcedHeaders) {
			if (!res.get(headerKey) || forceOverwite) { 
				res.header(headerKey, forcedHeaders[headerKey]);
				verboseLog("[" + req.url + "] setting '" + headerKey + "' to '" + forcedHeaders[headerKey] + "'");
			} else {
				verboseLog("[" + req.url + "] not setting '" + headerKey + "', it exists and forceOverwrite=false");
			}
		}
		res.oldWriteHead(statusCode, reasonPhrase, headers);
	}
});

function verboseLog (log) {
	if (!verboseLogging) return;
	console.log(log);
}

function completeAsyncStartup() {
	console.log("[config] forced headers: " + JSON.stringify(forcedHeaders));
	console.log("[config] overwrite existing headers: " + forceOverwite);
	console.log("[config] verbose logging: " + verboseLogging);
	console.log("[init] proxying requests at port " + process.env.PORT + " to " + targetURI);
	app.listen(process.env.PORT);
}