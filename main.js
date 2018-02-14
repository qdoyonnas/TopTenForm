// Require Modules
var http = require("http");
var path = require("path");
var express = require("express");
var session = require("express-session");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var mongoClient = require("mongodb");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

// Browser App Setup
var app = express();
var port = 3000;

// Mongo Connection Setup
var url = "mongodb://qdoyonnas:abc123@ds027809.mlab.com:27809/languages";
var dbName = "languages";
var db;
mongoClient.connect(url, function(error, client) {
	if( error ) { throw error; }
	
	console.log("Connected to MongoDb");
	db = client.db(dbName);
});

// Style
app.use(express.static(path.resolve(__dirname, "src/css")));

// App View Engine
app.set('views', path.resolve(__dirname, 'src/views'));
app.set('view engine', 'ejs');

// App modules
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());
app.use(session( {
	secret: "secretSession",
	resave: true,
	saveUninitialized: true
	}
));
app.use(passport.initialize());
app.use(passport.session());

// User Authentication Setup
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});
passport.use(new LocalStrategy(
	{
	usernameField: "",
	passwordField: ""
	},
	function(username, password, done) {
		db.collection("users").findOne({username:username}, function(error, result) {
			if( result.password === password ) {
				var user = result;
				done(null, user);
			} else {
				done(null, false, {message:"Incorrect Password"});
			}
		});
	}
));

// Methods
function EnsureAuthenticated(request, response, next) {
	if( request.isAuthenticated() ) {
		next();
	}
	else {
		response.redirect("/sign-in");
	}
}

function DeleteEntry() {
	console.log("Deleting Entry");
}

// Routes
app.get("/", EnsureAuthenticated, function(request, response) {
	db.collection("languages").find().toArray(function(error, results) {
		if( error ) { throw error; }
		response.render("index", {entries: results});
	});
});
app.get("/new-entry", function(request, response) {
	response.render("new-entry");
});

app.get("/delete-entry", function(request, response) {
	response.render("delete-entry");
});

app.get("/sign-in", function(request, response) {
	response.render("sign-in");
});

app.get("/sign-up", function(request, response) {
	response.render("sign-up");
});

app.get("/logout", function(request, response) {
	request.logout();
	response.redirect("sign-in");
});

app.post("/new-entry", function(request, response) {
	if( !request.body.title || !request.body.body ) {
		response.status(400).send("Entries must have some text");
		return;
	}
	
	request.body.published = new Date();
	db.collection(dbName).save(request.body, function(error, result) {
		if( error ) { throw error; }
		console.log("data saved");
		response.redirect("/");
	});
});

app.post("/delete-entry", function(request, response) {
	db.collection(dbName).deleteMany(request.body, function(error, result) {
		if( error ) { throw error; }
		console.log("Entries Deleted");
		response.redirect("/");
	});
});

app.post("/sign-up", function(request, response) {
	
	db.collection("users").save(request.body, function(error, result) {
		if( error ) { throw error; }
		console.log("User Saved");
	});
	
	request.login(request.body, function() {
		response.redirect("/sign-in");
	});
});

app.post("/sign-in", passport.authenticate("local", {
	failureRedirect:"/sign-in"
	}), function(request, response) {
			response.redirect("/");
	}
);

app.get("/profile", function(request, response) {
	response.json(request.user);
});

app.use(function(request, response) {
	response.status(404).render("404");
});

// Start local Server
app.listen(port, function() {
	console.log("Server listening on port " + port);
});