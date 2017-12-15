var sinon       = require("sinon");
var supertest   = require('supertest');
var should      = require("should");
var rewire      = require("rewire");
var main        = rewire("../main");

main.__set__("request", function(){
	console.log("request lol");
});

describe("header rewrite", function(){
	it("tests", function(done){
		done();
	});
});