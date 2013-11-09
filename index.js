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

var db = mongoose.connection;
var Page  = mongoose.model('Page',{ url: String, 'gifs': [{ id: String, user_id: String, gif_url: String, category: String }] });

/*var mike = new Page({ url: 'ah', 'gifs': [{ id: 'ad', user_id: 'wooga', gif_url: 'dooga', category: 'zooga'}] });
mike.save(function (err) {
    if(err) {
        console.log("Oh no an error" + err);
    }
    else {
        console.log("meow");
    }
});
*/
// CRUD

// takes json given and saves it to the DB
// first check to see if the page exists, if it does
// check if the gif alread exists. if it doesn't append it
// to the list
app.get("/db/create/:page", function(req, response) {

    // remember that the page is a json thing
   // var json_input = req.params['page'];
   // console.log(json_input['url']);

    // query the db
    Page.find({'url': json_input['url']}, function(error, pages) {
        console.log(pages);
        console.log(pages.length);
        var length = pages.length;

        // if there are no pages go ahead and make one
        if (length == 0) {
            var new_page = new Page(JSON.parse(req.params['page']));
            new_page.save(function(error) {
                if(error) {
                    console.log("Error creating new entry: " + error);
                }
                else {
                    console.log("Successfully added a new page");
                }
            });
        }
        else {
            var counter =0;
            for (counter=0;counter<length;counter++) {
                //if(pages[counter].id ==)
            }
        }
    });
});

app.get("/db/read/:page", function(req, response) {

    Page.find({'url': req.params['page']}, function(error, pages) {
        console.log(pages[0].gifs);
        response.send(JSON.stringify(pages[0].gifs)); // changed from send to write
    });

});

app.get("/db/remove/:page/:gif_id", function(req, response) {

    console.log("Last try");
    Page.where({"url":"gah" }).update({}, { $pull : { gifs : { "id" : "cad" } } } ,false, false);

    console.log(mike.gifs.remove());
    mike.save(function(err) {
        console.log("F this");
    });

    Page.update({}, { $pull : { gifs : { "id" : "cad" } } } ,false, false);
    // first query the database for a GIF with the corresponding ID
    Page.find({'url':req.params['page']}, function(error, pages) {
        pages.forEach(function(member) {
            console.log("I'm going through stuff! " + member);
            if(member.id === req.params['gif_id']) {
                // remove from database
                console.log("Yay now update the DB!! ---->" + member.id);
                console.log(Page.doc);
                Page.docs.forEach(function(element, index, array) {
                    console.log("hello");
                    console.log(element);
                    console.log(index);
                    console.log(array);
                });

                //Page.doc.array.pull(member.id);
                //Page.doc.save();

            }
        });
    });

});


// End DB stuff

app.get('/:gif_type', function(req, response) {

    // implement # special search functionality
    request("http://api.giphy.com/v1/gifs/search?q=" + req.params["gif_type"] + "&limit=10&api_key=dc6zaTOxFJmzC", function(error, response, body) {
        if(error) {
            console.log("failed to query api");
        }
        else {
            var json_response = JSON.parse(body);
            console.log(json_response);
            gif_response = json_response;
        }
    });

    response.send(JSON.stringify(gif_response));

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
