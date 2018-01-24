var http = require("http");
var path = require("path");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");

var app = express();
var port = 3000;

app.set('views', path.resolve(__dirname, 'src/views'));
app.set('view engine', 'ejs');

var entries = [];
app.locals.entries = entries;

app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", function(request, response) {
	response.render("index");
});
app.get("/new-entry", function(request, response) {
	response.render("new-entry");
});

app.post("/new-entry", function(request, response) {
	if( !request.body.title || !request.body.body ) {
		response.status(400).send("Entries must have some text");
		return;
	}
	
	console.log(request);
	
	entries.push({
		title: request.body.title,
		body: request.body.body,
		published: new Date()
	});
	response.redirect("/");
});

app.use(function(request, response) {
	response.status(404).render("404");
});

http.createServer(app).listen(port, function() {
	console.log("Server listening on port " + port);
});