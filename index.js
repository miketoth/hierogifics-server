var request = require("request");
var express = require("express");

var gif_response = "";
var app = express();

app.use(express.logger);

app.get("/", function(req, response) {
    response.send("Hello World");
});

var port = process.env.PORT || 24601;
app.listen(port, function() {
    console.log("Listening on " + port);
});
