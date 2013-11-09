var request = require("request");
var express = require("express");
var app = express();

var gif_response = "";

app.get('/:gif_type', function(req, response) {
    response.send("Hello World");
    console.log("I see...");

  //  request("http://api.giphy.com/v1/gifs/search?q=" + req.params["gif_type"] + "&limit=100&api_key=dc6zaTOxFJmzC", function(error, response, body) {
      request("http://api.giphy.com/v1/gifs/recent?api_key=dc6zaTOxFJmzC", function(error, response, body ) {
        if(error) {
            console.log("failed to query api");
        }
        else {
            var json_response = JSON.parse(body);
            response.send(json_response);
        }
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
