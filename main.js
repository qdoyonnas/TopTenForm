var express = require("express");

var app = express();
var port = 3000;

app.use(express.static("public"));
app.use(express.static("public/html"));

app.listen(port, function(error) {
	console.log("Server is running on port " + port);
});