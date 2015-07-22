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
var forcedHeaders	= require("./forced-headers.json");

console.log("forced headers: " + JSON.stringify(forcedHeaders));

app.get("*", function (req, res) {
	request(targetURI + req.url).pipe(res);
});

console.log("proxying requests at port " + process.env.PORT + " to " + targetURI);
var server = app.listen(process.env.PORT);