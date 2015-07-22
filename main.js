// cast-aws-proxy
// main.js
// julian lepinski 2015

if (!process.env.PORT){
	var localConfig = require("./.local-config.json");
	for (var i in localConfig) process.env[i] = localConfig[i];
}

console.log("");
console.log("cast-aws-proxy starting up...");

var http			= require("http");
var express			= require("express");
var request			= require("request");

var app				= express();
var targetURI		= process.env.ORIGIN_URI;
var forceOverwite	= process.env.OVERWRITE_EXISTING ? true : false;
var forcedHeaders	= require("./forced-headers.json");
var verboseLogging	= process.env.VERBOSE_LOGS ? true : false;

console.log("CONFIG: forced headers: " + JSON.stringify(forcedHeaders));
console.log("CONFIG: overwrite existing headers: " + forceOverwite);
console.log("CONFIG: verbose logging: " + verboseLogging);

app.get("*", function (req, res) {
	verboseLog("[" + req.url + "] proxying request to " + targetURI + req.url);
	request(targetURI + req.url).pipe(res);

	res.oldWriteHead = res.writeHead;
	res.writeHead = function(statusCode, reasonPhrase, headers){
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

function verboseLog(log){
	if (!verboseLogging) return;
	console.log(log);
}

console.log("proxying requests at port " + process.env.PORT + " to " + targetURI);
var server = app.listen(process.env.PORT);