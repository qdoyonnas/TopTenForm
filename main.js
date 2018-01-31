var http = require("http");
var path = require("path");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var mongoClient = require("mongodb");

var url = "mongodb://localhost:27017/";
var app = express();
var port = 3000;
mongoClient.connect(url);

app.set('views', path.resolve(__dirname, 'src/views'));
app.set('view engine', 'ejs');



app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", function(request, response) {
	mongoClient.connect(url, function(error, mongodb) {
		if( error ) { throw error; }
		
		var db = mongodb.db("languages");
		db.collection("languages").find().toArray(function(error, results) {
			if( error ) { throw error; }
			mongodb.close();
			response.render("index", {entries: results});
		});
	});
});
app.get("/new-entry", function(request, response) {
	response.render("new-entry");
});

app.post("/new-entry", function(request, response) {
	if( !request.body.title || !request.body.body ) {
		response.status(400).send("Entries must have some text");
		return;
	}
	
	mongoClient.connect(url, function(error, mongodb) {
		if( error ) { throw error; }
		
		var db = mongodb.db("languages");
		db.collection("languages").save(request.body, function(error, result) {
			if( error ) { throw error; }
			console.log("data saved");
			mongodb.close();
			response.redirect("/");
		});
	});
	
	/*entries.push({
		title: request.body.title,
		body: request.body.body,
		published: new Date()
	});
	response.redirect("/");*/
});

app.use(function(request, response) {
	response.status(404).render("404");
});

http.createServer(app).listen(port, function() {
	console.log("Server listening on port " + port);
});