// cast-aws-proxy
// main.js
// julian lepinski 2015

if (!process.env.PORT){
	var localConfig = require("./.local-config.json");
	for (var i in localConfig) process.env[i] = localConfig[i];
}

console.log("");
console.log("cast-aws-proxy starting up...");

var http          = require("http");
var httpProxy		  = require("http-proxy");

var targetURI		  = process.env.ORIGIN_URI;
var forcedHeaders	= require("./forced-headers.json");

var proxy = httpProxy.createProxyServer({});
proxy.on('proxyReq', function(proxyReq, req, res, options) {
  console.log(req.url);
  for (var i in forcedHeaders) res.setHeader(i, forcedHeaders[i]);
});

console.log("forced headers follow:");
console.dir(forcedHeaders);

console.log("proxying requests at port " + process.env.PORT + " to " + targetURI);
var server = http.createServer(function(req, res) {
  proxy.web(req, res, { target: targetURI, secure: false });
});
server.listen(process.env.PORT);