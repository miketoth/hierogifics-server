var request = require("request");
var express = require("express");
var mongoose = require('mongoose');

var app = express();

var gif_response = "";

// twilio set up
var accountSid = "AC11cfc9227df28d65fabfdd270cdcb940";
var authToken = "1d057f8fcce46bd9eb3c228dd72836a6";
var client = require('twilio')(accountSid, authToken);


// connect to DB and do DB stuff

var uri_string = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/local';

mongoose.connect(uri_string, function (err, res) {
      if (err) {
        console.log ('ERROR connecting to: ' + uri_string + '. ' + err);
    } else {
        console.log ('Succeeded connected to: ' + uri_string);
    }
});

var Page  = mongoose.model('Page',{ url: String, 'gifs': [{ id: String, user_id: String, gif_url: String, category: String }] });

var mike = new Page({ url: 'hi', 'gifs': [{ id: 'grr', user_id: 'brr', gif_url: 'boop', category: 'whomp'}] });
mike.save(function (err) {
    if(err) {
        console.log("Oh no an error" + err);
    }
    else {
        console.log("meow");
    }
});

// CRUD

// takes json given and saves it to the DB
app.get("/db/create/:page", function(req, response) {
    var new_page = new Page(JSON.parse(req.params['page']));
    new_page.save(function(error) {
        if(error) {
            console.log("Error creating new entry: " + error);
        }
        else {
            console.log("Successfully added a new page");
        }
    });
});

app.get("db/remove/gif/:page/:gif_id", function(req, response) {

    // first query the database for a GIF with the corresponding ID
    Page.findOne({'url':req.params['page']}, function(error, pages) {
        pages.gifs.forEach(function(member, pages) {
            if(member.id === req.params['gif_id']) {
                // remove from database
                console.log("Yay now update the DB!! ---->" + member.id);
                Page.pages.pull(member.id);
                Page.save();

            }
        })
    })

});


// End DB stuff

app.get('/:gif_type', function(req, response) {

    // implement # special search functionality
    request("http://api.giphy.com/v1/gifs/search?q=" + req.params["gif_type"] + "&limit=100&api_key=dc6zaTOxFJmzC", function(error, response, body) {
        if(error) {
            console.log("failed to query api");
        }
        else {
            var json_response = JSON.parse(body);
            console.log(json_response);
            gif_response = json_response;
        }
    });

    response.send(gif_response);

});

app.get('/sms/:number/:body', function(req, response) {

    // parse JSON given as body and send texts based on that
    var json_response = JSON.parse(req.params['body']);

    for(var i=0;i<json_response.length;i++) {
        console.log(json_response[i].text);

        // check that json_response[i].text is at most 165 characters

  /*      client.sendMessage({
            body: json_response[i].text,
            to: "+1"+req.params["number"],
            from: "+16106281295"
        }, function(error, message) {
            console.log("Error " + message.sid);
            process.stdout.write(message.sid);
        });
*/

    }

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
