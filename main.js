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
var httpProxy		= require("http-proxy");

var instanceName	= "heroku-cast-aws-proxy-" + uniqueToken(3);
var targetURI		= process.env.ORIGIN_URI;

var forcedHeaders	= require("./forced-headers.json");

var proxy = httpProxy.createProxyServer({});
var server = http.createServer(function(req, res) {
  proxy.web(req, res, { target: targetURI, toProxy: true });
});

server.listen(process.env.PORT);

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  for (var i in forcedHeaders){
  	res.setHeader(i, forcedHeaders[i]);
  }
});

console.log("");
console.log("forced headers follow:");
console.dir(forcedHeaders);
console.log("");

console.log("proxying requests at port " + process.env.PORT + " to " + targetURI);

/////////////////////
// helpers/prototypes
/////////////////////

function uniqueToken(length) {
    var fullToken = (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace(/\./g, '-');
    if (length === null){
        return fullToken;
    } else {
        var shortenedToken = fullToken.substring(0, length);
        return shortenedToken;
    }
}