var express = require("express");
var app = express();

app.get('/', function(req, response) {

    console.log("geez");
});

var port = process.env.PORT || 24601;
app.listen(port, function() {
    console.log("Listening on " + port);
});
