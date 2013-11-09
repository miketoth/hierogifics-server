var express = require("express");
var app = express();

app.get('/', function(req, response) {
    response.send("Hello World");
    console.log("I see...");
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
