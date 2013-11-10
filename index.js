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

/*var mike = new Page({ url: 'hah', 'gifs': [{ id: 'mad', user_id: 'wooga', gif_url: 'dooga', category: 'zooga'}] });
mike.save(function (err) {
    if(err) {
        console.log("Oh no an error" + err);
    }
    else {
        console.log("meow");
    }
});
*/

//


// CRUD

// takes json given and saves it to the DB
// first check to see if the page exists, if it does
// check if the gif alread exists. if it doesn't append it
// to the list
app.get("/db/create/:page", function(req, response) {

    // remember that the page is a json thing
    var json_input = JSON.parse(req.params['page']);
    //json_input = JSON.parse(json_input);

    // query the db
    Page.find({'url': json_input['url']}, function(error, pages) {
        // Breaks when nothing is in DB

        var length = 0;

        if(pages[0] !== null && typeof(pages[0]) !== undefined) {
            length = pages[0].length; // there should only be one entry in the DB that matches
        }

    // NOTE: there could be a page with no gifs in the DB because we remove gifs as the page changes, but still keep the page

        // if there are no pages go ahead and make one
        if (length == 0) {
            var new_page = new Page(json_input);
            new_page.save(function(error) {
                if(error) {
                    console.log("Error creating new entry: " + error);
                }
                else {
                    console.log("Successfully added a new page");
                }
            });
        }
        // otherwise there is a page so add all gifs not present to the end of it
        else {
            // iterate through all of the gifs and see if any of their ids match any of the ones passed in
            var match = false;
            var counter =0;
            var inner_counter = 0;
            var match_val = -1;
            var push_val = -1;

            for(counter=0;counter<json_input.gifs.length;counter++) {
                for (inner_counter=0;inner_counter<pages[0].gifs.length;inner_counter++) {
                    if(pages[0].gifs[counter].id === json_input.gifs[inner_counter].id) {
                        match = true;
                    }
                    else {
                        match_val = counter;
                        push_val = inner_counter;
                    }
                }
            }
                // if not already in list; add it!
                if(!match) {

                    var conditions = {'gifs': pages[0].gifs }; // update all documents matching these parameters
                    var update = { $push : { 'gifs' :  json_input.gifs[push_val]}} ;
                    var options ={upsert: true};

                    Page.update(conditions, update, options, function(err, numberAffected){
                        console.log("Error: " + err + " numberAffected " + numberAffected);
                    });

                    // reset match
                    match = false;
                    match_val = -1;
                }
        }
    });
});

app.get("/db/read/:page", function(req, response) {

    Page.find({'url': req.params['page']}, function(error, pages) {

        if(typeof(pages[0]) !== undefined && pages[0] !== null) {
            if(typeof(pages[0].gifs) !== undefined && pages[0].gifs !== null) {
                console.log(pages[0].gifs);
                response.send(JSON.stringify(pages[0].gifs)); // changed from send to write
            }
        }
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
    request("http://api.giphy.com/v1/gifs/search?q=" + req.params["gif_type"] + "&limit=10&api_key=dc6zaTOxFJmzC", function(error, gifResponse, body) {
        if(error) {
            console.log("failed to query api");
        }
        else {
            response.send(body);
        }
    });


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

var port = process.env.PORT || 24601;
app.listen(port, function() {
    console.log("Listening on " + port);
});
